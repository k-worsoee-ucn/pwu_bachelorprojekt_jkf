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
        type: [String, Number],
        required: false,
        default: '',
    },
    startDate: {
        type: String,
        required: false,
        default: 'N/A',
    },
    expectedEndDate: {
        type: String,
        required: false,
        default: '',
    },
    step: {
        type: Number,
        required: true,
    },
    totalSteps: {
        type: Number,
        required: false,
        default: 6,
        validator: (value) => value >= 2,
    },
    stepTitles: {
        type: Array,
        required: false,
        default: () => [
            'Salg - Sag oprettelse',
            'Under produktion',
            'Produktbilleder',
            'Installationsbilleder',
            'Referencer',
            'Afslutning/upload',
        ],
    },
    status: {
        type: String,
        required: false,
        default: '',
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
            <div
                class="progress-fill"
                :style="{ width: (status === 'completed' ? '100%' : ((step - 1) / totalSteps) * 100 + '%') }"
            ></div>
            <div class="step-dots">
                <span
                    v-for="n in (totalSteps - 1)"
                    :key="n"
                    class="dot"
                    :class="{ active: n < step }"
                    :style="{ left: ((n) / (totalSteps)) * 100 + '%' }"
                    :title="stepTitles[n] || `Step ${n + 2}`"
                ></span>
            </div>
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
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 0;
            pointer-events: auto;
        }
        .dot {
            position: absolute;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background-color: #ffffff;
            border-radius: 50%;
            z-index: 1;
            transition: background 0.3s;
            pointer-events: auto;

            &:first-child {
                transform: translate(0%, -50%);
            }
            &:last-child {
                transform: translate(-100%, -50%);
            }
        }
        .dot.active {
            box-sizing: border-box;
            background: #4caf50;
            border: 2px solid #fff;
        }
    }
}
</style>