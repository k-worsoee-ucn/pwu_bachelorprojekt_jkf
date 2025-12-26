<script setup>
import { useRouter } from "vue-router";

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
    default: "",
  },
  startDate: {
    type: String,
    required: false,
    default: "N/A",
  },
  createdAt: {
    type: String,
    required: false,
    default: "N/A",
  },
  expectedEndDate: {
    type: String,
    required: false,
    default: "",
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
      "Salg - Sag oprettelse",
      "Under produktion",
      "Produktbilleder",
      "Installationsbilleder",
      "Referencer",
      "Afslutning/upload",
    ],
  },
  status: {
    type: String,
    required: false,
    default: "ongoing",
  },
});

const handleClick = () => {
  router.push({ name: "SingleProcess", params: { id: props.id } });
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
        <p class="date">{{ createdAt }}</p>
      </div>
      <div class="column column-icon">
        <i class="fa-solid fa-chevron-right"></i>
      </div>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{
          width:
            status === 'completed' || status === 'Completed'
              ? '100%'
              : ((step - 1) / totalSteps) * 100 + '%',
        }"
      ></div>
      <div class="step-dots">
        <span
          v-for="n in totalSteps - 1"
          :key="n"
          class="dot"
          :class="{ active: n < step }"
          :style="{ left: (n / totalSteps) * 100 + '%' }"
          :title="stepTitles[n] || `Step ${n + 2}`"
        ></span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.process-card {
  @include default-border;
  background-color: $neutral-100-light;
  overflow: hidden;
  box-shadow: $box-shadow;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: $box-shadow-hover;
    background-color: $neutral-200-light;
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
    background-color: $neutral-500-light;
    position: relative;
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: $success-400;
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
      background: $success-400;
      border: 2px solid #fff;
    }
  }
}
</style>
