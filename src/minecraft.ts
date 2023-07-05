import store from './storage';

export interface MinecraftVersion{
    version: string;
    type: "release" | "snapshot" | "old_beta" | "old_alpha";
    url: string;
    releaseTime: Date;
}

export interface MinecraftVersions{
    latest: {
        release: string;
        snapshot: string;
    };
    versions: { [version: string]: MinecraftVersion };
}

export async function getVersions(): Promise<MinecraftVersions>{
    let data: any;
    const cachedVersions = localStorage.getItem("cache.versions");
    if(cachedVersions){
        data = JSON.parse(cachedVersions);
    }else{
        const response = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
        const rawData: any = await response.json();

        data = { latest: rawData.latest, versions: {} };

        for(const version of rawData.versions){
            data.versions[version.id] = {
                version: version.id,
                type: version.type,
                url: version.url,
                releaseTime: version.releaseTime
            };
        }
    }

    for(const version of Object.values<any>(data.versions)){
        version.releaseTime = new Date(version.releaseTime);
    }
    if(!cachedVersions){
        localStorage.setItem("cache.versions", JSON.stringify(data));
    }
    return data;
}

export interface Method{
    obfuscated: string;
    argumentTypes: string[];
    returnType: string;
}

export interface Field{
    obfuscated: string;
    type: string;
}

export interface MinecraftMappings{
    [ className: string ]: {
        obfuscated: string,
        methods: { [name: string]: Method[] },
        fields: { [name: string]: Field },
    };
}

export async function getMappings(version: string, type: "client" | "server" = "server"): Promise<MinecraftMappings | null>{
    const sanitizedVersion = version.replace(".", "_");
    if(store.has(`cache.mappings.${sanitizedVersion}`)){
        return store.get(`cache.mappings.${sanitizedVersion}`) as any;
    }

    const versions = await getVersions();
    const versionResponse = await fetch(versions.versions[version].url);
    const versionData: any = await versionResponse.json();

    if(versionData.downloads === undefined || versionData.downloads[type + "_mappings"] === undefined){
        return null;
    }

    const mappingResponse = await(fetch(versionData.downloads[type + "_mappings"].url));
    const mappings = parseMappings(await mappingResponse.text());
    
    store.set(`cache.mappings.${sanitizedVersion}`, mappings);

    return mappings;
}

function parseMappings(text: string){
    const rawData = text.split("\n");

    const mappings: MinecraftMappings = {};

    function processType(type: string){
        if(type.startsWith("java.lang.")){
            return type.substring("java.lang.".length);
        }else{
            return type;
        }
    }

    let currentClass: MinecraftMappings[any];
    for(const line of rawData){
        if(line.startsWith("#") || !line){
            continue;
        }
        if(/^\S/.test(line)){
            // class

            const [ _, className, obfuscated ] = /^([^ ]+) -> (.+):/.exec(line)!;

            currentClass = mappings[className] = {
                obfuscated,
                methods: {},
                fields: {}
            };
        }else if(/[()]/.test(line)){
            // method

            const [ _, returnType, name, argumentsText, obfuscated ] = /^\s+(?:\d+:\d+:)?([^ ]+) ([^(]+)\(((?:[^,]+,)*[^,]+)?\) -> (.+)/.exec(line)!;

            if(name === "<init>" || name == "<clinit>"){
                continue;
            }

            const argumentTypes = argumentsText?.split(",")?.map(type => processType(type));

            if(!Object.hasOwn(currentClass!.methods, name)){
                currentClass!.methods[name] = [];
            }

            currentClass!.methods[name].push({
                obfuscated,
                argumentTypes: argumentTypes ?? [],
                returnType: processType(returnType)
            });
        }else{
            // field

            const [ _, type, name, obfuscated ] = /^\s+([^ ]+) ([^ ]+) -> (.+)/.exec(line)!;

            currentClass!.fields[name] = {
                obfuscated,
                type: processType(type)
            };
        }
    }

    return mappings;
}

export function deleteCache(){
    for(const key of store.keys()){
        if(key.startsWith("cache.")){
            store.delete(key);
        }
    }
    for(const key of Object.keys(localStorage)){
        if(key.startsWith("cache.")){
            localStorage.removeItem(key);
        }
    }
}