export const createFilterState = () => ({
  step: [],
  salesManager: [],
  year: [],
  month: [],
  consent: [],
  industry: [],
  country: [],
  customer: [],
  productGroup: [],
  ventilation: [],
  extractionVolumeFrom: "",
  extractionVolumeTo: "",
  volumeFlowFrom: "",
  volumeFlowTo: "",
});

export const applyFilters = (processes, activeFilters, searchDisplayText) => {
  let filtered = processes;

  // Apply search filter
  if (searchDisplayText.trim()) {
    const query = searchDisplayText.toLowerCase();
    filtered = filtered.filter((process) => {
      const sale = process.sale;
      return (
        process.title.toLowerCase().includes(query) ||
        process.caseNo.toString().includes(query) ||
        process.status.toLowerCase().includes(query) ||
        sale?.description?.toLowerCase().includes(query) ||
        sale?.endUser?.toLowerCase().includes(query) ||
        sale?.country?.toLowerCase().includes(query) ||
        sale?.industry?.toLowerCase().includes(query) ||
        sale?.customIndustry?.toLowerCase().includes(query) ||
        sale?.plantType?.toLowerCase().includes(query) ||
        sale?.filterType?.toLowerCase().includes(query) ||
        sale?.fanType?.toLowerCase().includes(query) ||
        sale?.dustType?.toLowerCase().includes(query) ||
        sale?.ductSystem?.toLowerCase().includes(query) ||
        sale?.totalExtractionVolume?.toString().includes(query) ||
        sale?.pressure?.toString().includes(query) ||
        sale?.volumeFlow?.toString().includes(query) ||
        sale?.phoneNumber?.includes(query) ||
        sale?.customer?.name?.toLowerCase().includes(query) ||
        sale?.salesManager?.name?.toLowerCase().includes(query) ||
        sale?.saleProducts?.some((sp) =>
          sp.product?.title?.toLowerCase().includes(query)
        )
      );
    });
  }

  // Apply step filter
  if (activeFilters.step && activeFilters.step.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.step.includes(String(process.currentStep))
    );
  }

  // Apply sales manager filter
  if (activeFilters.salesManager && activeFilters.salesManager.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.salesManager.includes(
        String(process.sale?.salesManager?.id)
      )
    );
  }

  // Apply year filter
  if (activeFilters.year && activeFilters.year.length > 0) {
    filtered = filtered.filter((process) => {
      const year = new Date(process.createdAt).getFullYear();
      return activeFilters.year.includes(String(year));
    });
  }

  // Apply month filter
  if (activeFilters.month && activeFilters.month.length > 0) {
    filtered = filtered.filter((process) => {
      const month = String(new Date(process.createdAt).getMonth() + 1).padStart(
        2,
        "0"
      );
      return activeFilters.month.includes(month);
    });
  }

  // Apply consent filter
  if (activeFilters.consent && activeFilters.consent.length > 0) {
    filtered = filtered.filter((process) => {
      const consentValue = process.consent ? "true" : "false";
      return activeFilters.consent.includes(consentValue);
    });
  }

  // Apply industry filter
  if (activeFilters.industry && activeFilters.industry.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.industry.includes(process.sale?.industry)
    );
  }

  // Apply country filter
  if (activeFilters.country && activeFilters.country.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.country.includes(process.sale?.country)
    );
  }

  // Apply customer filter
  if (activeFilters.customer && activeFilters.customer.length > 0) {
    filtered = filtered.filter((process) =>
      activeFilters.customer.includes(process.sale?.customer?.name)
    );
  }

  // Apply filter product type
  if (activeFilters.productGroup && activeFilters.productGroup.length > 0) {
    filtered = filtered.filter((process) => {
      return process.sale?.saleProducts?.some((sp) =>
        activeFilters.productGroup.includes(sp.product?.title)
      );
    });
  }

  // Apply ventilation product type
  if (activeFilters.ventilation && activeFilters.ventilation.length > 0) {
    filtered = filtered.filter((process) => {
      return process.sale?.saleProducts?.some((sp) =>
        activeFilters.ventilation.includes(sp.product?.title)
      );
    });
  }

  // Apply extraction volume range filter
  if (activeFilters.extractionVolumeFrom || activeFilters.extractionVolumeTo) {
    filtered = filtered.filter((process) => {
      const extractionVolume = process.sale?.totalExtractionVolume;
      if (!extractionVolume) return false;

      if (
        activeFilters.extractionVolumeFrom &&
        extractionVolume < parseInt(activeFilters.extractionVolumeFrom)
      ) {
        return false;
      }
      if (
        activeFilters.extractionVolumeTo &&
        extractionVolume > parseInt(activeFilters.extractionVolumeTo)
      ) {
        return false;
      }
      return true;
    });
  }

  // Apply volume flow range filter
  if (activeFilters.volumeFlowFrom || activeFilters.volumeFlowTo) {
    filtered = filtered.filter((process) => {
      const volumeFlow = process.sale?.volumeFlow;
      if (!volumeFlow) return false;

      if (
        activeFilters.volumeFlowFrom &&
        volumeFlow < parseInt(activeFilters.volumeFlowFrom)
      ) {
        return false;
      }
      if (
        activeFilters.volumeFlowTo &&
        volumeFlow > parseInt(activeFilters.volumeFlowTo)
      ) {
        return false;
      }
      return true;
    });
  }

  return filtered;
};

export const resetFilters = (activeFilters) => {
  activeFilters.value = createFilterState();
};
