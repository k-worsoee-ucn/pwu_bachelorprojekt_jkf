<script setup>
import { ref } from 'vue';
import ProcessCard from '@/components/ProcessCard.vue';
import { processes as mockProcesses } from '@/js/mockProcesses.js';

const processes = ref(mockProcesses);
</script>

<template>
    <div class="processes-container">
        <h1>My Processes</h1>
        <div class="cards-grid">
            <ProcessCard
                v-for="process in processes"
                :key="process.id"
                :id="process.id"
                :name="process.name"
                :caseNumber="process.caseNumber"
                :startDate="process.startDate"
                :expectedEndDate="process.expectedEndDate"
                :step="process.step"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.processes-container {
    padding: 2rem;

    h1 {
        margin-bottom: 2rem;
        color: #333;
    }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }
}
</style>