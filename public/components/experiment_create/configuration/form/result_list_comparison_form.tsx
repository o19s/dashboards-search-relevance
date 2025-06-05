import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'; // Add forwardRef and useImperativeHandle
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { IndexOption, ResultListComparisonFormData } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';

// 1. Define a Ref interface for ResultListComparisonForm
export interface ResultListComparisonFormRef {
  validateAndSetErrors: () => boolean;
  clearAllErrors: () => void;
}

interface ResultListComparisonFormProps {
  formData: ResultListComparisonFormData;
  onChange: (field: keyof ResultListComparisonFormData, value: any) => void;
  http: CoreStart['http'];
}

// 2. Make ResultListComparisonForm a forwardRef component
export const ResultListComparisonForm = forwardRef<ResultListComparisonFormRef, ResultListComparisonFormProps>(
  ({ formData, onChange, http }, ref) => {
    // Defensive initialization of states from formData
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

    // 3. Add local validation states (errors)
    const [querySetError, setQuerySetError] = useState<string[]>([]);
    const [kError, setKError] = useState<string[]>([]);
    const [searchConfigError, setSearchConfigError] = useState<string[]>([]);

    // 4. Function to clear all local error states
    const clearAllErrors = () => {
      setQuerySetError([]);
      setKError([]);
      setSearchConfigError([]);
    };

    // useEffect to update internal state if formData prop changes (e.g., template type switch)
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

      // CRUCIAL: Clear all errors when formData changes (e.g., template type switch)
      clearAllErrors();
    }, [formData]);

    // 5. This function will run validation and set the error messages.
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

      // Validate Search Configuration (assuming maxNumberOfOptions is 2, so at least 2 are needed)
      // Adjust this validation based on the actual requirements for maxNumberOfOptions
      if (selectedSearchConfigs.length < 2) { // Assuming 2 configurations are required for comparison
        setSearchConfigError(['Please select at least two search configurations to compare.']);
        isValid = false;
      } else {
        setSearchConfigError([]);
      }

      return isValid;
    };

    // Expose the validateAndSetErrors and clearAllErrors functions to the parent via ref
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

    const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      setK(value);
      onChange('size', value);
      // Clear error immediately on valid change
      if (!isNaN(value) && value >= 1 && kError.length > 0) {
        setKError([]);
      }
    };

    const handleSearchConfigChange = (selectedOptions: IndexOption[]) => {
      setSelectedSearchConfigs(selectedOptions);
      onChange('searchConfigurationList', selectedOptions.map((o) => o.value));
      // Clear error immediately on valid change (assuming at least 2 are needed)
      if (selectedOptions.length >= 2 && searchConfigError.length > 0) {
        setSearchConfigError([]);
      }
    };

    return (
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="m" direction="row" style={{ maxWidth: 600 }}>
            <EuiFlexItem grow={4}>
              {/* 7. Wrap QuerySetsComboBox in EuiFormRow for label and validation */}
              <EuiFormRow
                label="Query Set"
                isInvalid={querySetError.length > 0} // Only invalid if there's an error message
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
              {/* 7. Wrap EuiFieldNumber in EuiFormRow for label and validation */}
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
                  isInvalid={kError.length > 0} // Add isInvalid to EuiFieldNumber itself too
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          {/* 7. Wrap SearchConfigForm in EuiFormRow for label and validation */}
          <EuiFormRow
            label="Search Configurations"
            helpText={`Select ${2} search configuration${2 > 1 ? 's' : ''} to compare against each other.`} // Hardcoding 2 as per SearchConfigForm prop
            isInvalid={searchConfigError.length > 0}
            error={searchConfigError}
          >
            <SearchConfigForm
              selectedOptions={selectedSearchConfigs}
              onChange={handleSearchConfigChange}
              http={http}
              maxNumberOfOptions={2}
              hideLabel={true}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
);
