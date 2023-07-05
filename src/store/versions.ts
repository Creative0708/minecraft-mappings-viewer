
import { defineStore } from 'pinia';
import * as minecraft from '../minecraft';

interface VersionsState{
    versions: minecraft.MinecraftVersions | undefined;
    loading: boolean;
    includeSnapshots: boolean;
}

export const useVersionsStore = defineStore('versions', {
    state(){
        return {
            versions: undefined,
            loading: false,
            includeSnapshots: false
        } as VersionsState;
    },
    actions: {
        async load(){
            if(this.versions !== undefined){
                return;
            }

            this.loading = true;
            this.versions = await minecraft.getVersions();
            this.loading = false;
        },
        getVersionIDs(){
            if(this.versions === undefined){
                return [];
            }
            
            const allVersions = Object.entries(this.versions.versions);
            let versions;
            if(this.includeSnapshots){
                versions = allVersions.map(([id, version]) => id);
            }else{
                versions = allVersions
                    .filter(([id, version]) => version.type != "snapshot")
                    .map(([id, version]) => id);
            }

            // Versions below 1.14.4 don't have mappings
            versions.splice(versions.indexOf("1.14.4") + 1);

            return versions;
        }
    }
});