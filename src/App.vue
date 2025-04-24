<script setup lang="ts">

// https://vuejs.org/api/sfc-script-setup.html#script-setup

import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/bootstrap4-dark-blue/theme.css';
import 'primeicons/primeicons.css';
import './index.css';

import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import ConfirmDialog from 'primevue/confirmdialog';
import Button from 'primevue/button';

import { useVersionsStore } from './store/versions';
import { onMounted, ref } from 'vue';

import { useConfirm } from 'primevue/useconfirm';

import Cookies from 'js-cookie';
import MappingsViewer from './components/MappingsViewer.vue';

const confirm = useConfirm();

const selectedVersion = ref<string | undefined>();
const versionsStore = useVersionsStore();

const acceptedEULA = ref<boolean | null>(Cookies.get('acceptedEULA') === 'true' ? true : null);
const saveReadEULA = ref<boolean>(false);

function confirmEULA(){
  confirm.require({
    group: 'eula',

    header: 'Minecraft EULA',

    acceptLabel: 'Accept',
    acceptIcon: 'pi pi-check',
    rejectLabel: 'Reject',
    rejectIcon: 'pi pi-times',

    accept(){
      acceptedEULA.value = true;
      if(saveReadEULA.value){
        Cookies.set('acceptedEULA', 'true');
      }

      load();
    },
    reject(){
      acceptedEULA.value = false;
    },
    onHide(){
      acceptedEULA.value = false;
    }
  })
}

onMounted(() => {
  if(acceptedEULA.value){
    load();
  } else if(acceptedEULA.value === null){
    confirmEULA();
  }
});

function load(){
  versionsStore.load();
}

</script>

<template>
  <div class="w-screen h-screen bg-ground font-sans text-text flex flex-col p-1">
    <nav class="bg-overlay m-2 mb-0.5 px-4 py-3 rounded-md flex flex-row items-center gap-5">
      <h1 class="text-2xl"> Minecraft Mappings Viewer </h1>
      <Dropdown v-model="selectedVersion" :options="versionsStore.getVersionIDs()" placeholder="Version" :loading="versionsStore.loading" class="w-32" />
      <div>
        <label class="mr-2">Include Snapshots</label>
        <Checkbox v-model="versionsStore.includeSnapshots" :binary="true" />
      </div>

      <div class="ml-auto align-middle">
        Made with <i class="pi pi-heart-fill text-red-400"></i> by <a href="https://github.com/Creative0708/" class="underline text-text">Colin Cai</a>
      </div>
    </nav>

    <main class="bg-overlay m-2 p-3 rounded-md flex-grow overflow-hidden relative">
      <MappingsViewer v-if="acceptedEULA === true" :version="selectedVersion" />
      <div v-if="acceptedEULA === false" class="w-full h-full flex items-center justify-center">
        <div class="flex flex-col items-center">
          <p>
            You must accept the Minecraft EULA to use this app.
          </p>
          <Button label="Confirm EULA" @click="confirmEULA"></Button>
        </div>
      </div>

      <div class="right-0 bottom-0 p-3 absolute text-sm">
        Icons by <a href="https://icons8.com/" class="underline text-text">Icons8</a>
      </div>
    </main>

    <ConfirmDialog group="eula">
      <template #message>
        <div class="leading-8">
          <p class="m-0">To use this app, you must accept the Minecraft EULA:</p>
          <a href="https://aka.ms/MinecraftEULA" class="underline text-blue-300">https://aka.ms/MinecraftEULA</a>
          <div class="flex items-center mt-6">
            <label class="mr-2 text-sm">Don't show this again</label>
            <Checkbox v-model="saveReadEULA" :binary="true" />
          </div>
        </div>
      </template>
    </ConfirmDialog>
  </div>
</template>
