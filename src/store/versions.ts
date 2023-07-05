
import { defineStore } from 'pinia';
import * as minecraft from '../minecraft';

interface VersionsState{
    versions: minecraft.MinecraftVersions | undefined;
    loading: boolean;
    includeSnapshots: boolean;
}

export const useVersionsStore = defineStore('mappings', {
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
            if(this.includeSnapshots){
                return allVersions.map(([id, version]) => id);
            }else{
                return allVersions
                    .filter(([id, version]) => version.type != "snapshot")
                    .map(([id, version]) => id);
            }
        }
    }
});