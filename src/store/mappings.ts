
import { defineStore } from 'pinia';
import * as minecraft from '../minecraft';

interface MappingsState{
    mappings: minecraft.MinecraftMappings | null | undefined;
    loading: boolean;
}

interface MappingsSearchResult{
    className: string;
    obfuscated: string;
    methods?: (minecraft.Method & { name: string })[];
    fields?: (minecraft.Field & { name: string })[];
}

interface MappingsSearchResults{
    numResults: number,
    limitReached: boolean,
    results: MappingsSearchResult[]
}

export const useMappingsStore = defineStore('mappings', {
    state(){
        return {
            mappings: undefined,
            loading: false,
        } as MappingsState;
    },
    actions: {
        async loadMappings(version: string, type: "client" | "server" = "server"){
            this.loading = true;
            this.mappings = await minecraft.getMappings(version, type);
            this.loading = false;

            return this.mappings;
        },
        findMappings(filter: string, limit: number): MappingsSearchResults{
            if(!this.mappings){
                return {
                    numResults: 0,
                    limitReached: false,
                    results: []
                };
            }

            filter = filter.toLowerCase();
            
            const results: MappingsSearchResult[] = [];
            const classMatchResults: MappingsSearchResult[] = [];

            function limitReached(){
                return { numResults: limit, limitReached: true, results: classMatchResults.concat(results) };
            }

            let numResults = 0;

            for(const [ className, classData ] of Object.entries(this.mappings)){

                const methods = [], fields = [];

                const classMatch = className.toLowerCase().includes(filter);
                if(classMatch){
                    // Add everything

                    for(const [ methodName, methodData ] of Object.entries(classData.methods)){
                        for(const method of methodData){
                            if(++numResults > limit){
                                return limitReached();
                            }

                            methods.push({
                                name: methodName,
                                ...method
                            });
                        }
                    }

                    for(const [ fieldName, fieldData ] of Object.entries(classData.fields)){
                        if(++numResults > limit){
                            return limitReached();
                        }

                        fields.push({
                            name: fieldName,
                            ...fieldData
                        });
                    }

                }else{
                    for(const [ methodName, methodData ] of Object.entries(classData.methods)){
                        if(methodName.toLowerCase().includes(filter)){
                            for(const method of methodData){
                                if(++numResults > limit){
                                    return limitReached();
                                }

                                methods.push({
                                    name: methodName,
                                    ...method
                                });
                            }
                        }
                    }

                    for(const [ fieldName, fieldData ] of Object.entries(classData.fields)){
                        if(fieldName.toLowerCase().includes(filter)){
                            if(++numResults > limit){
                                return limitReached();
                            }

                            fields.push({
                                name: fieldName,
                                ...fieldData
                            });
                        }
                    }
                }

                if(methods.length > 0 || fields.length > 0){
                    if(++numResults > limit){
                        return limitReached();
                    }

                    const data = {
                        className: className,
                        obfuscated: classData.obfuscated,
                        methods: methods.length > 0 ? methods : undefined,
                        fields: fields.length > 0 ? fields : undefined
                    };

                    if(classMatch){
                        classMatchResults.push(data);
                    }else{
                        results.push(data);
                    }
                }
            }

            return {
                numResults,
                limitReached: false,
                results: classMatchResults.concat(results)
            };
        }
    }
});