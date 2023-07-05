
import { defineStore } from 'pinia';
import * as minecraft from '../minecraft';

interface MappingsState{
    versions: minecraft.MinecraftVersions | undefined;
    mappings: minecraft.MinecraftMappings | undefined;
    loading: boolean;
}

export const useMappingsStore = defineStore('mappings', {
    state(){
        return {
            versions: undefined,
            mappings: undefined,
            loading: false,
        } as MappingsState;
    },
    actions: {
        async loadVersions(){
            this.loading = true;
            this.versions = await minecraft.getVersions();
        },
        async loadMappings(){
            this.loading = true;
            await minecraft.getMappings
        }
    }
});