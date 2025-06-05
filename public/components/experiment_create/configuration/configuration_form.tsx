import React, { useState, useEffect, useRef } from 'react';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import { ResultListComparisonForm, ResultListComparisonFormRef } from './form/result_list_comparison_form';
import { PointwiseExperimentForm, PointwiseExperimentFormRef } from './form/pointwise_experiment_form';
import { HybridOptimizerExperimentForm, HybridOptimizerExperimentFormRef } from './form/hybrid_optimizer_experiment_form';
import {
  ConfigurationFormProps,
  ConfigurationFormData,
  ResultListComparisonFormData,
  PointwiseExperimentFormData,
  HybridOptimizerExperimentFormData,
  LLMFormData,
  TemplateType,
} from './types';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { GetStartedAccordion } from '../get_started_accordion';

const getInitialFormData = (templateType: TemplateType): ConfigurationFormData => {
  const baseCommonData = {
    querySetId: '',
    size: 10,
    searchConfigurationList: [],
  };

  switch (templateType) {
    case TemplateType.QuerySetComparison:
      return {
        ...baseCommonData,
        type: "PAIRWISE_COMPARISON",
      } as ResultListComparisonFormData;
    case TemplateType.SearchEvaluation:
      return {
        ...baseCommonData,
        judgmentList: [],
        type: "POINTWISE_EVALUATION",
      } as PointwiseExperimentFormData;
    case TemplateType.HybridSearchOptimizer:
      return {
        ...baseCommonData,
        judgmentList: [],
        type: "HYBRID_OPTIMIZER",
      } as HybridOptimizerExperimentFormData;
    default:
        console.warn(`Attempted to get initial form data for unhandled TemplateType: ${templateType}. Returning a minimal base configuration.`);
        return {
            ...baseCommonData,
            type: "UNKNOWN_TYPE" as any,
        } as ConfigurationFormData;
  }
};

interface ConfigurationFormProps {
  templateType: TemplateType;
  onSave: (data: ConfigurationFormData, isValid: boolean) => void;
  validateTrigger: number;
}

export const ConfigurationForm = ({ templateType, onSave, validateTrigger }: ConfigurationFormProps) => {
  const {
    services: { http },
  } = useOpenSearchDashboards();

  const [formData, setFormData] = useState<ConfigurationFormData>(getInitialFormData(templateType));
  const [showFormError, setShowFormError] = useState<boolean>(false);

  const pointwiseFormRef = useRef<PointwiseExperimentFormRef>(null);
  const resultListFormRef = useRef<ResultListComparisonFormRef>(null);
  const hybridOptimizerFormRef = useRef<HybridOptimizerExperimentFormRef>(null);

  useEffect(() => {
    setFormData(getInitialFormData(templateType));
    setShowFormError(false);
    if (pointwiseFormRef.current) {
      pointwiseFormRef.current.clearAllErrors();
    }
    if (resultListFormRef.current) {
      resultListFormRef.current.clearAllErrors();
    }
    if (hybridOptimizerFormRef.current) {
      hybridOptimizerFormRef.current.clearAllErrors();
    }
  }, [templateType]);

  useEffect(() => {
    if (validateTrigger > 0) {
      let isValid = true;
      switch (templateType) {
        case TemplateType.SearchEvaluation:
          if (pointwiseFormRef.current) {
            isValid = pointwiseFormRef.current.validateAndSetErrors();
          } else {
            isValid = false;
          }
          break;
        case TemplateType.QuerySetComparison:
          if (resultListFormRef.current) {
            isValid = resultListFormRef.current.validateAndSetErrors();
          } else {
            isValid = false;
          }
          break;
        case TemplateType.HybridSearchOptimizer:
          if (hybridOptimizerFormRef.current) {
            isValid = hybridOptimizerFormRef.current.validateAndSetErrors();
          } else {
            isValid = false;
          }
          break;
        default:
          isValid = false;
          break;
      }
      onSave(formData, isValid);
      setShowFormError(!isValid);
    } else {
      onSave(formData, false);
      setShowFormError(false);
    }
  }, [validateTrigger, templateType, formData, onSave]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowFormError(false);
  };

  const renderForm = () => {
    switch (templateType) {
      case TemplateType.QuerySetComparison:
        return (
          <>
            <GetStartedAccordion isOpen={true} templateType={templateType} />
            <EuiSpacer size="l" />
            <ResultListComparisonForm
              formData={formData as ResultListComparisonFormData}
              onChange={handleChange}
              http={http}
              ref={resultListFormRef}
            />
          </>
        );
      case TemplateType.SearchEvaluation:
        return (
          <>
            <GetStartedAccordion isOpen={true} templateType={templateType} />
            <EuiSpacer size="l" />
            <PointwiseExperimentForm
              formData={formData as PointwiseExperimentFormData}
              onChange={handleChange}
              http={http}
              ref={pointwiseFormRef}
            />
          </>
        );
      case TemplateType.HybridSearchOptimizer:
        return (
          <>
            <GetStartedAccordion isOpen={true} templateType={templateType} />
            <EuiSpacer size="l" />
            <HybridOptimizerExperimentForm
              formData={formData as HybridOptimizerExperimentFormData}
              onChange={handleChange}
              http={http}
              ref={hybridOptimizerFormRef}
            />
          </>
        );
      default:
        console.warn(`No form component defined for templateType: ${templateType}`);
        return null;
    }
  };

  return (
    <>
      {showFormError && (
        <EuiCallOut
          // Changed the title here
          title="Please address the highlighted errors."
          color="danger"
          size="l"
        >
        </EuiCallOut>
      )}
      <EuiSpacer size="s" />
      {renderForm()}
    </>
  );
};
