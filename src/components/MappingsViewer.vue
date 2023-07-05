<script setup lang="ts">
import InputText from 'primevue/inputtext';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

import { ref, watch } from 'vue';
import { TreeNode } from 'primevue/tree';

import { useMappingsStore } from '../store/mappings';

const props = defineProps<{
  version?: string;
}>();

const search = ref<string>('');

const searchTimeout = ref<number | undefined>(undefined);

watch(search, (value) => {
  if (searchTimeout.value !== undefined) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    getFormattedResults(value);
  }, 250);
});

const mappingsStore = useMappingsStore();
const mappingsUnavailable = ref(false);

watch(() => props.version, (version) => {
  if(version){
    mappingsStore.loadMappings(version).then((mappings) => {
      if(mappings === null){
        mappingsUnavailable.value = true;
      }else{
        mappingsUnavailable.value = false;
        getFormattedResults(search.value);
      }
    });
  }
});

const statusMsg = ref<string>('');
const formattedResults = ref<TreeNode[] | undefined>();

function getFormattedResults(search: string, limit: number = Infinity){

  const { numResults, limitReached, results } = mappingsStore.findMappings(search, limit);

  if(limitReached){
    statusMsg.value = `Limiting results to ${limit}`;
  }else if(numResults === 0){
    statusMsg.value = 'No results found';
  }else{
    statusMsg.value = `${numResults} results found`;
  }

  const formattedData: TreeNode[] = [];

  for(const {
    className,
    obfuscated,
    methods,
    fields,
  } of results){
    const packageName = className.substring(0, className.lastIndexOf('.'));

    const classNode: TreeNode = {
      key: className,
      data: {
        name: className,
        obfuscated: `${packageName}.${obfuscated}`
      },
      children: (fields || methods) ? [] : undefined,
    };

    if(methods){
      for(const method of methods){
        classNode.children!.push({
          key: `${className}.${method.name}`,
          data: {
            name: `${method.returnType} ${method.name}(${method.argumentTypes.join(', ')})`,
            obfuscated: `${method.returnType} ${method.obfuscated}(${method.argumentTypes.join(', ')})`
          },
        });
      }
    }
    if(fields){
      for(const field of fields){
        classNode.children!.push({
          key: `${className}.${field.name}`,
          data: {
            name: `${field.type} ${field.name}`,
            obfuscated: `${field.type} ${field.obfuscated}`
          },
        });
      }
    }

    formattedData.push(classNode);
  }

  formattedResults.value = formattedData;
}

</script>

<template>
  <InputText v-model="search" placeholder="Search" class="w-full mb-2" />
  <p class="text-sm mt-6 mb-2">{{ statusMsg }}</p>
  <div v-if="version === undefined" class="w-full h-full flex items-center justify-center">
    <h1>
      Select a Minecraft Version to view mappings
    </h1>
  </div>
  <div v-else-if="mappingsUnavailable" class="w-full h-full flex items-center justify-center">
    <h1>
      Mappings aren't available for this version
    </h1>
  </div>
  <TreeTable :value="formattedResults" v-else scrollable scrollHeight="flex" :loading="mappingsStore.loading"
    :paginator="true" :rows="50" :rowsPerPageOptions="[50, 100, 500, 1000]"
    :pt="{ paginator: { class: 'tt-paginator' } }">
    <Column field="name" header="Unobfuscated Name" expander></Column>
    <Column field="obfuscated" header="Mapping"></Column>
  </TreeTable>
</template>

<style>
.tt-paginator {
  transform: translateY(-5rem);
}
</style>