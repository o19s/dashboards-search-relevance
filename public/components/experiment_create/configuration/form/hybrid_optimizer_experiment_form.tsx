import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { IndexOption, HybridOptimizerExperimentFormData } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';
import { JudgmentsComboBox } from './judgments_combo_box';

export interface HybridOptimizerExperimentFormRef {
  validateAndSetErrors: () => boolean;
  clearAllErrors: () => void;
}

interface HybridOptimizerExperimentFormProps {
  formData: HybridOptimizerExperimentFormData;
  onChange: (field: keyof HybridOptimizerExperimentFormData, value: any) => void;
  http: CoreStart['http'];
}

export const HybridOptimizerExperimentForm = forwardRef<
  HybridOptimizerExperimentFormRef,
  HybridOptimizerExperimentFormProps
>(({ formData, onChange, http }, ref) => {
  const [querySetOptions, setQuerySetOptions] = useState<IndexOption[]>(
    formData?.querySetId
      ? [{ label: formData.querySetId, value: formData.querySetId }]
      : []
  );
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<IndexOption[]>(
    Array.isArray(formData?.searchConfigurationList)
      ? formData.searchConfigurationList.map((config) => ({ label: config, value: config }))
      : []
  );
  const [k, setK] = useState<number>(
    formData?.size !== undefined && formData?.size !== null ? formData.size : 10
  );
  const [judgmentOptions, setJudgmentOptions] = useState<IndexOption[]>(
    Array.isArray(formData?.judgmentList)
      ? formData.judgmentList.map((judgment) => ({ label: judgment, value: judgment }))
      : []
  );

  const [querySetError, setQuerySetError] = useState<string[]>([]);
  const [kError, setKError] = useState<string[]>([]);
  const [searchConfigError, setSearchConfigError] = useState<string[]>([]);
  const [judgmentError, setJudgmentError] = useState<string[]>([]);

  const clearAllErrors = () => {
    setQuerySetError([]);
    setKError([]);
    setSearchConfigError([]);
    setJudgmentError([]);
  };

  useEffect(() => {
    setQuerySetOptions(
      formData?.querySetId
        ? [{ label: formData.querySetId, value: formData.querySetId }]
        : []
    );
    setSelectedSearchConfigs(
      Array.isArray(formData?.searchConfigurationList)
        ? formData.searchConfigurationList.map((config) => ({ label: config, value: config }))
        : []
    );
    setK(formData?.size !== undefined && formData?.size !== null ? formData.size : 10);
    setJudgmentOptions(
      Array.isArray(formData?.judgmentList)
        ? formData.judgmentList.map((judgment) => ({ label: judgment, value: judgment }))
        : []
    );
    clearAllErrors();
  }, [formData]);

  const validateAndSetErrors = (): boolean => {
    let isValid = true;

    // Validate Query Set
    if (!querySetOptions.length) {
      setQuerySetError(['Please select a query set.']);
      isValid = false;
    } else {
      setQuerySetError([]);
    }

    // Validate K Value
    if (isNaN(k) || k < 1) {
      setKError(['K value must be a positive number.']);
      isValid = false;
    } else {
      setKError([]);
    }

    // Validate Search Configuration (maxNumberOfOptions is 1, so exactly one is needed)
    if (selectedSearchConfigs.length !== 1) {
      setSearchConfigError(['Please select exactly one search configuration.']);
      isValid = false;
    } else {
      setSearchConfigError([]);
    }

    // Validate Judgments
    if (!judgmentOptions.length) {
      setJudgmentError(['Please select at least one judgment list.']);
      isValid = false;
    } else {
      setJudgmentError([]);
    }

    return isValid;
  };

  useImperativeHandle(ref, () => ({
    validateAndSetErrors,
    clearAllErrors,
  }));

  const handleQuerySetsChange = (selectedOptions: IndexOption[]) => {
    setQuerySetOptions(selectedOptions || []);
    onChange('querySetId', selectedOptions?.[0]?.value);
    // Clear error immediately on valid change IF an error was previously set
    if (selectedOptions.length > 0 && querySetError.length > 0) {
      setQuerySetError([]);
    }
  };

  const handleJudgmentsChange = (selectedOptions: IndexOption[]) => {
    setJudgmentOptions(selectedOptions || []);
    onChange('judgmentList', selectedOptions.map((o) => o.value));
    // Clear error immediately on valid change IF an error was previously set
    if (selectedOptions.length > 0 && judgmentError.length > 0) {
      setJudgmentError([]);
    }
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setK(value);
    onChange('size', value);
    // Clear error immediately on valid change IF an error was previously set
    if (!isNaN(value) && value >= 1 && kError.length > 0) {
      setKError([]);
    }
  };

  const handleSearchConfigChange = (selectedOptions: IndexOption[]) => {
    setSelectedSearchConfigs(selectedOptions);
    onChange('searchConfigurationList', selectedOptions.map((o) => o.value));
    // Clear error immediately on valid change (assuming exactly 1 is needed)
    if (selectedOptions.length === 1 && searchConfigError.length > 0) {
      setSearchConfigError([]);
    }
  };

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
          <EuiFlexItem grow={4}>
            <EuiFormRow
              label="Query Set"
              isInvalid={querySetError.length > 0}
              error={querySetError}
            >
              <QuerySetsComboBox
                selectedOptions={querySetOptions}
                onChange={handleQuerySetsChange}
                http={http}
                hideLabel={true}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem grow={1}>
            <EuiFormRow
              label="K Value"
              helpText="The number of documents to include from the result list."
              isInvalid={kError.length > 0}
              error={kError}
            >
              <EuiFieldNumber
                placeholder="Enter k value"
                value={k}
                onChange={handleKChange}
                min={1}
                fullWidth
                isInvalid={kError.length > 0}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label="Search Configuration"
          helpText="Select exactly one search configuration."
          isInvalid={searchConfigError.length > 0}
          error={searchConfigError}
        >
          <SearchConfigForm
            selectedOptions={selectedSearchConfigs}
            onChange={handleSearchConfigChange}
            http={http}
            maxNumberOfOptions={1} // Set to 1 as per HybridOptimizer requirements
            hideLabel={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label="Judgments"
          isInvalid={judgmentError.length > 0}
          error={judgmentError}
        >
          <JudgmentsComboBox
            selectedOptions={judgmentOptions}
            onChange={handleJudgmentsChange}
            http={http}
            hideLabel={true}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});
