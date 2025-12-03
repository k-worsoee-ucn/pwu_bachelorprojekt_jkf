<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { processes as mockProcesses } from '@/js/mockProcesses.js';
import SalesStep from '@/components/SalesStep.vue'

const route = useRoute();
const router = useRouter();
const processId = route.params.id;

const process = ref(null);

onMounted(() => {
    process.value = mockProcesses.find(p => p.id === parseInt(processId));
});

const goBack = () => {
    router.back();
};
</script>

<template>
    <div class="single-process-container" v-if="process">
        <button class="back-button" @click="goBack">
            <i class="fa-solid fa-chevron-left"></i> Back
        </button>
        <h1>{{ process.name }}</h1>
        <p><strong>Case Number:</strong> {{ process.caseNumber }}</p>
        <p><strong>Start Date:</strong> {{ process.startDate }}</p>
        <p><strong>Expected End Date:</strong> {{ process.expectedEndDate }}</p>
        <p><strong>Current Step:</strong> {{ process.step }} / 6</p>
        <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (process.step / 6) * 100 + '%' }"></div>
        </div>
    </div>
    <div v-else>
        <p>Process not found</p>
    </div>
    <div>
        <SalesStep :process="process" />
    </div>
</template>

<style scoped lang="scss">
.single-process-container {
    padding: 2rem;

    .back-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        margin-bottom: 1.5rem;
        background-color: #204485;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #0B5ED7;
        }

        i {
            font-size: 1.2rem;
        }
    }

    h1 {
        margin-bottom: 1.5rem;
    }

    p {
        margin-bottom: 1rem;
        font-size: 1rem;
    }

    .progress-bar {
        height: 8px;
        background-color: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 1.5rem;

        .progress-fill {
            height: 100%;
            background-color: #4caf50;
            transition: width 0.3s ease;
        }
    }
}
</style>