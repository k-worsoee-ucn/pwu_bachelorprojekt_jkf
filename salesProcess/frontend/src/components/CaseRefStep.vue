<template>
  <div class="case-ref-step">
    <h3>Case & Reference Creation</h3>
    <p>Download case data and images separately</p>

    <div class="download-section">
      <button
        @click="generatePDF"
        :disabled="generatingPDF || props.disabled"
        class="btn"
      >
        <span v-if="generatingPDF">Generating PDF...</span>
        <span v-else>Download Sale Data (PDF)</span>
      </button>

      <button
        @click="downloadImages"
        :disabled="generatingZip || props.disabled"
        class="btn"
      >
        <span v-if="generatingZip">Creating ZIP...</span>
        <span v-else>Download Images (ZIP)</span>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { useAuth } from "../composables/useAuth";

const { getAuthHeader } = useAuth();

const props = defineProps({
  processId: {
    type: [String, Number],
    required: true,
  },
  process: {
    type: Object,
    required: false,
    default: null,
  },
  sale: {
    type: Object,
    required: false,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const generatingPDF = ref(false);
const generatingZip = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Fetch images from server
const fetchImages = async (type) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/processes/${props.processId}/images?type=${type}`,
      {
        headers: {
          ...getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} images`);
    }

    const result = await response.json();
    return result.images || [];
  } catch (error) {
    console.error(`Error fetching ${type} images:`, error);
    return [];
  }
};

// Convert image URL to base64
const imageUrlToBase64 = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
    img.src = `http://localhost:3000${url}`;
  });
};

// Generate PDF with sale data only
const generatePDF = async () => {
  generatingPDF.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    // Create new PDF document
    const doc = new jsPDF();
    let yPosition = 20;

    // Add title
    doc.setFontSize(20);
    doc.text("Case Package", 20, yPosition);
    yPosition += 15;

    // Add sale data if available
    if (props.sale || props.process?.sale) {
      const saleData = props.sale || props.process?.sale;
      const privacy = saleData.privacySettings || {};

      doc.setFontSize(16);
      doc.text("Sale Information", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);

      if (saleData.title && !privacy.title) {
        doc.text(`Title: ${saleData.title}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.description && !privacy.description) {
        doc.text(`Description: ${saleData.description}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.endUser && !privacy.endUser) {
        doc.text(`End User: ${saleData.endUser}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.country && !privacy.country) {
        doc.text(`Country: ${saleData.country}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.industry && !privacy.industry) {
        doc.text(`Industry: ${saleData.industry}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.customIndustry && !privacy.customIndustry) {
        doc.text(`Custom Industry: ${saleData.customIndustry}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.phoneNumber && !privacy.phoneNumber) {
        doc.text(`Phone Number: ${saleData.phoneNumber}`, 20, yPosition);
        yPosition += 8;
      }

      yPosition += 5;

      // Technical specifications
      doc.setFontSize(14);
      doc.text("Technical Specifications", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(12);
      if (saleData.plantType && !privacy.plantType) {
        doc.text(`Plant Type: ${saleData.plantType}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.filterType && !privacy.filterType) {
        doc.text(`Filter Type: ${saleData.filterType}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.fanType && !privacy.fanType) {
        doc.text(`Fan Type: ${saleData.fanType}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.dustType && !privacy.dustType) {
        doc.text(`Dust Type: ${saleData.dustType}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.ductSystem && !privacy.ductSystem) {
        doc.text(`Duct System: ${saleData.ductSystem}`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.totalExtractionVolume && !privacy.totalExtractionVolume) {
        doc.text(
          `Total Extraction Volume: ${saleData.totalExtractionVolume} m³/h`,
          20,
          yPosition
        );
        yPosition += 8;
      }
      if (saleData.pressure && !privacy.pressure) {
        doc.text(`Pressure: ${saleData.pressure} Pa`, 20, yPosition);
        yPosition += 8;
      }
      if (saleData.volumeFlow && !privacy.volumeFlow) {
        doc.text(`Volume Flow: ${saleData.volumeFlow} m³/h`, 20, yPosition);
        yPosition += 8;
      }

      yPosition += 7;

      // Add customer information if available
      if (saleData.customer) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.text("Customer Information", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        if (!privacy.customerId) {
          doc.text(`Name: ${saleData.customer.name || "N/A"}`, 20, yPosition);
          yPosition += 8;
        }
        if (saleData.customer.website && !privacy.manufacturerWebsite) {
          doc.text(`Website: ${saleData.customer.website}`, 20, yPosition);
          yPosition += 8;
        }
        if (saleData.customer.email) {
          doc.text(`Email: ${saleData.customer.email}`, 20, yPosition);
          yPosition += 8;
        }
        if (saleData.customer.phone) {
          doc.text(`Phone: ${saleData.customer.phone}`, 20, yPosition);
          yPosition += 8;
        }
        if (saleData.customer.address) {
          doc.text(`Address: ${saleData.customer.address}`, 20, yPosition);
          yPosition += 8;
        }
        yPosition += 7;
      }

      // Add products if available and not all product types are private
      if (
        saleData.saleProducts &&
        saleData.saleProducts.length > 0 &&
        (!privacy.selectedFilters ||
          !privacy.selectedFans ||
          !privacy.selectedDucts)
      ) {
        // Filter products based on privacy settings
        const visibleProducts = saleData.saleProducts.filter((sp) => {
          const productCategory = sp.product?.category;
          if (
            productCategory === "filtersAndSeparators" &&
            privacy.selectedFilters
          )
            return false;
          if (productCategory === "fanSystems" && privacy.selectedFans)
            return false;
          if (productCategory === "ductSystems" && privacy.selectedDucts)
            return false;
          return true;
        });

        if (visibleProducts.length > 0) {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(16);
          doc.text("Products", 20, yPosition);
          yPosition += 10;

          doc.setFontSize(12);
          visibleProducts.forEach((sp, index) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(
              `${index + 1}. ${sp.product?.title || "Unknown"} - Quantity: ${
                sp.quantity
              }`,
              20,
              yPosition
            );
            yPosition += 8;
          });
          yPosition += 7;
        }
      }
    }

    // Download the PDF
    doc.save(`case-${props.process?.caseNo || "package"}.pdf`);

    successMessage.value = "PDF generated successfully!";
  } catch (error) {
    console.error("Error generating PDF:", error);
    errorMessage.value = "Failed to generate PDF: " + error.message;
  } finally {
    generatingPDF.value = false;
  }
};

// Download images as ZIP
const downloadImages = async () => {
  generatingZip.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    // Fetch production images (step 3)
    const productionImages = await fetchImages("production");

    // Fetch installation images (step 4)
    const installationImages = await fetchImages("installation");

    if (productionImages.length === 0 && installationImages.length === 0) {
      errorMessage.value = "No images found to download.";
      return;
    }

    // Create a new ZIP file
    const zip = new JSZip();

    // Add production images
    if (productionImages.length > 0) {
      const productionFolder = zip.folder("production-images");
      for (let i = 0; i < productionImages.length; i++) {
        try {
          const response = await fetch(
            `http://localhost:3000${productionImages[i].url}`,
            {
              headers: {
                ...getAuthHeader(),
              },
            }
          );
          const blob = await response.blob();
          productionFolder.file(`production-${i + 1}.jpg`, blob);
        } catch (error) {
          console.error(`Error adding production image ${i + 1}:`, error);
        }
      }
    }

    // Add installation images
    if (installationImages.length > 0) {
      const installationFolder = zip.folder("installation-images");
      for (let i = 0; i < installationImages.length; i++) {
        try {
          const response = await fetch(
            `http://localhost:3000${installationImages[i].url}`,
            {
              headers: {
                ...getAuthHeader(),
              },
            }
          );
          const blob = await response.blob();
          installationFolder.file(`installation-${i + 1}.jpg`, blob);
        } catch (error) {
          console.error(`Error adding installation image ${i + 1}:`, error);
        }
      }
    }

    // Generate and download the ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `case-${props.process?.caseNo || "package"}-images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    successMessage.value = "Images downloaded successfully!";
  } catch (error) {
    console.error("Error creating ZIP:", error);
    errorMessage.value = "Failed to download images: " + error.message;
  } finally {
    generatingZip.value = false;
  }
};
</script>

<style scoped lang="scss">
.case-ref-step {
  padding: 20px;

  h3 {
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 20px;
  }

  .download-section {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }
}
</style>
