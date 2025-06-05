import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiFieldNumber } from '@elastic/eui';
import { ResultListComparisonFormData, IndexOption } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { SearchConfigForm } from '../search_configuration_form';
import { QuerySetsComboBox } from './query_sets_combo_box';
import { JudgmentsComboBox } from './judgments_combo_box';

interface PointwiseExperimentFormProps {
  formData: ResultListComparisonFormData;
  onChange: (field: keyof ResultListComparisonFormData, value: any) => void;
  http: CoreStart['http'];
}

export interface PointwiseExperimentFormRef {
  validateAndSetErrors: () => boolean;
  clearAllErrors: () => void;
}

export const PointwiseExperimentForm = forwardRef<PointwiseExperimentFormRef, PointwiseExperimentFormProps>(
  ({ formData, onChange, http }, ref) => {
    const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<IndexOption[]>([]);
    const [querySetOptions, setQuerySetOptions] = useState<IndexOption[]>([]);
    const [k, setK] = useState<number>(10);
    const [judgmentOptions, setJudgmentOptions] = useState<IndexOption[]>([]);

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
      if (formData.querySetId) {
        setQuerySetOptions([{ label: formData.querySetId, value: formData.querySetId }]);
      } else {
        setQuerySetOptions([]);
      }
      if (formData.size !== undefined && formData.size !== null) {
        setK(formData.size);
      } else {
        setK(10);
      }
      if (formData.searchConfigurationList && formData.searchConfigurationList.length > 0) {
        setSelectedSearchConfigs(
          formData.searchConfigurationList.map((config) => ({ label: config, value: config }))
        );
      } else {
        setSelectedSearchConfigs([]);
      }
      if (formData.judgmentList && formData.judgmentList.length > 0) {
        setJudgmentOptions(
          (formData.judgmentList as string[]).map((judgment) => ({ label: judgment, value: judgment }))
        );
      } else {
        setJudgmentOptions([]);
      }
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

      // Validate Search Configuration
      if (!selectedSearchConfigs.length) {
        setSearchConfigError(['Please select at least one search configuration.']);
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
      // Clear error immediately on valid change IF an error was previously set
      if (selectedOptions.length > 0 && searchConfigError.length > 0) {
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
              <EuiFormRow
                label="K Value"
                helpText="The number of documents to include from the result list."
                isInvalid={kError.length > 0} // Only invalid if there's an error message
                error={kError}
              >
                <EuiFieldNumber
                  placeholder="Enter k value"
                  value={k}
                  onChange={handleKChange}
                  min={1}
                  fullWidth
                  isInvalid={kError.length > 0} // Also for the input field itself
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            label="Search Configuration"
            isInvalid={searchConfigError.length > 0} // Only invalid if there's an error message
            error={searchConfigError}
          >
            <SearchConfigForm
              selectedOptions={selectedSearchConfigs}
              onChange={handleSearchConfigChange}
              http={http}
              maxNumberOfOptions={1}
              hideLabel={true}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            label="Judgments"
            isInvalid={judgmentError.length > 0} // Only invalid if there's an error message
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
  }
);
