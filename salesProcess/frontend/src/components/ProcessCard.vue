<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    caseNumber: {
        type: String,
        required: false,
        default: '',
    },
    startDate: {
        type: String,
        required: true,
    },
    expectedEndDate: {
        type: String,
        required: false,
        default: '',
    },
    step: {
        type: Number,
        required: true,
        validator: (value) => value >= 1 && value <= 6,
    },
});

const handleClick = () => {
    router.push({ name: 'SingleProcess', params: { id: props.id } });
};
</script>
<template>
    <div class="process-card" @click="handleClick">
        <div class="card-content">
            <div class="column column-name">
                <h3>{{ name }}</h3>
                <p class="case-number">{{ caseNumber }}</p>
            </div>
            <div class="column column-date">
                <h4 class="label">Dato:</h4>
                <p class="date">{{ startDate }} - {{ expectedEndDate }}</p>
            </div>
            <div class="column column-icon">
                <i class="fa-solid fa-chevron-right"></i>
            </div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (step / 6) * 100 + '%' }"></div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.process-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-content {
        padding: 1.5rem;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        align-items: center;
        flex-grow: 1;

        .column {
            display: grid;
            grid-auto-flow: row;
            justify-content: center;

            &.column-name {
                justify-content: left;

                h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1rem;
                    color: #333;
                    font-weight: 600;
                }

                .case-number {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #999;
                }
            }

            &.column-date {
                text-align: right;

                .label {
                    margin: 0 0 0.25rem 0;
                    font-weight: normal;
                    text-align: left;
                }

                .date {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #333;
                    font-weight: 500;
                }
            }

            &.column-icon {
                display: flex;
                align-items: center;
                justify-content: right;

                i {
                    font-size: 1.2rem;
                }
            }
        }
    }

    .progress-bar {
        height: 8px;
        background-color: #e0e0e0;
        position: relative;
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
            height: 100%;
            background-color: #4caf50;
            transition: width 0.3s ease;
            border-radius: 4px;
        }

        .step-dots {
            display: none;
        }
    }
}
</style>