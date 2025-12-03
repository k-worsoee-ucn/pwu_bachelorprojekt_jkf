<script setup>
import { ref, computed } from 'vue';
import ProcessCard from '@/components/ProcessCard.vue';
import { processes as mockProcesses } from '@/js/mockProcesses.js';

const searchQuery = ref('');
const allProcesses = ref(mockProcesses);

const filteredProcesses = computed(() => {
    if (!searchQuery.value.trim()) {
        return allProcesses.value;
    }

    const query = searchQuery.value.toLowerCase();
    return allProcesses.value.filter(process => 
        process.name.toLowerCase().includes(query) ||
        process.caseNumber.toLowerCase().includes(query) ||
        process.startDate.includes(query) ||
        process.expectedEndDate.includes(query)
    );
});

const ongoingProcesses = computed(() => {
    return filteredProcesses.value.filter(process => process.step < 6);
});

const completedProcesses = computed(() => {
    return filteredProcesses.value.filter(process => process.step === 6);
});
</script>

<template>
    <div class="processes-container">
        <h1>My Processes</h1>
        <div class="search-container">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, case number, or date..."
                class="search-input"
            />
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
        </div>

        <!-- Ongoing Section -->
        <div class="section">
            <h2>Ongoing</h2>
            <div class="cards-grid">
                <ProcessCard
                    v-for="process in ongoingProcesses"
                    :key="process.id"
                    :id="process.id"
                    :name="process.name"
                    :caseNumber="process.caseNumber"
                    :startDate="process.startDate"
                    :expectedEndDate="process.expectedEndDate"
                    :step="process.step"
                />
                <div v-if="ongoingProcesses.length === 0" class="no-results">
                    <p>No ongoing processes found.</p>
                </div>
            </div>
        </div>

        <!-- Completed Section -->
        <div class="section">
            <h2>Completed</h2>
            <div class="cards-grid">
                <ProcessCard
                    v-for="process in completedProcesses"
                    :key="process.id"
                    :id="process.id"
                    :name="process.name"
                    :caseNumber="process.caseNumber"
                    :startDate="process.startDate"
                    :expectedEndDate="process.expectedEndDate"
                    :step="process.step"
                />
                <div v-if="completedProcesses.length === 0" class="no-results">
                    <p>No completed processes found.</p>
                </div>
            </div>
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

    .search-container {
        margin-bottom: 2rem;
        position: relative;
        width: 100%;
        max-width: 500px;

        .search-input {
            width: 100%;
            padding: 0.75rem 2.5rem 0.75rem 1rem;
            font-size: 1rem;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            transition: border-color 0.3s ease;
            box-sizing: border-box;

            &:focus {
                outline: none;
                border-color: #204485;
                box-shadow: 0 0 0 3px rgba(32, 68, 133, 0.1);
            }

            &::placeholder {
                color: #999;
            }
        }

        .search-icon {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            pointer-events: none;
            font-size: 1rem;
        }
    }

    .section {
        margin-bottom: 3rem;

        h2 {
            margin-bottom: 1.5rem;
            color: #333;
            font-size: 1.3rem;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 0.75rem;
        }

        .cards-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;

            .no-results {
                grid-column: 1 / -1;
                text-align: center;
                padding: 2rem;
                color: #666;

                p {
                    margin: 0;
                    font-size: 1.1rem;
                }
            }
        }
    }
}
</style>