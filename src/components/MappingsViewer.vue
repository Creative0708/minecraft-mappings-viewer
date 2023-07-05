<script setup lang="ts">
import InputText from 'primevue/inputtext';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

import { ref, watch } from 'vue';

defineProps({
    version: {
        type: String,
        required: false
    }
});

const search = ref<string>('');

const searchTimeout = ref<number | undefined>(undefined);

watch(search, (value) => {
    if(searchTimeout.value !== undefined){
        clearTimeout(searchTimeout.value);
    }
    
    searchTimeout.value = setTimeout(() => {
        alert(value);
    }, 250);
})

</script>

<template>
    <InputText v-model="search" placeholder="Search" class="w-full mb-2" />
    <TreeTable>
        <Column field="name" header="Name" hidden/>
    </TreeTable>
</template>