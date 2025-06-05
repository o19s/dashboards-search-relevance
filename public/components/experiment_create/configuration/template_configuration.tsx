import React, { useState } from 'react';

import { EuiFlexItem, EuiFlexGroup, EuiTitle, EuiSpacer, EuiLoadingSpinner, EuiCallOut } from '@elastic/eui';
import { withRouter } from 'react-router-dom';
import { ConfigurationForm } from './configuration_form';
import { ConfigurationActions } from './configuration_action';
import { TemplateConfigurationProps, ConfigurationFormData, SearchConfigFromData } from './types';
import { Routes, ServiceEndpoints } from '../../../../common';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { EuiPanel } from '@elastic/eui';

export const TemplateConfiguration = ({
  templateType,
  onBack,
  onClose,
  history,
}: TemplateConfigurationProps) => {
  const [configFormData, setConfigFormData] = useState<ConfigurationFormData | null>(null);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showTemplateConfigError, setShowTemplateConfigError] = useState<boolean>(false);
  const [validateTrigger, setValidateTrigger] = useState<number>(0);

  const handleConfigSave = (data: ConfigurationFormData, isValid: boolean) => {
    setConfigFormData(data);
    setIsFormValid(isValid);
  };

  const {
    services: { http, notifications },
  } = useOpenSearchDashboards();

  const handleNext = async () => {
    // Increment validateTrigger to tell ConfigurationForm to validate
    setValidateTrigger(prev => prev + 1);
    setTimeout(async () => {
      // Check isFormValid AFTER ConfigurationForm has had a chance to validate
      if (!isFormValid) { // Use the updated state
        setShowTemplateConfigError(true);
        return;
      }

      setShowTemplateConfigError(false); // Hide the general error if valid

      if (configFormData) { // configFormData should be valid if isFormValid is true
        try {
          setIsCreating(true);
          const response = await http.post(ServiceEndpoints.Experiments, {
            body: JSON.stringify(configFormData),
          });

          if (response.experiment_id) {
            setExperimentId(response.experiment_id);
            notifications.toasts.addSuccess(`Experiment ${response.experiment_id} created successfully`);
            history.push(`/experiment/`);
          } else {
            throw new Error('No experiment ID received');
          }
        } catch (err) {
          notifications.toasts.addError(err, {
            title: 'Failed to create experiment',
          });
        } finally {
          setIsCreating(false);
        }
      }
    }, 0); // Use a 0ms timeout to put this on the next tick of the event loop
  };


  const handleBackToConfig = () => {
    setShowEvaluation(false);
  };

  const renderConfiguration = () => (
    <EuiPanel>
      <EuiFlexGroup direction="column" gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiTitle size="m">
            <h2>{templateType} Experiment</h2>
          </EuiTitle>
          <EuiSpacer size="m" />
          <ConfigurationForm
            templateType={templateType}
            onSave={handleConfigSave}
            validateTrigger={validateTrigger} // Pass the validateTrigger prop
          />
        </EuiFlexItem>

        <EuiFlexItem>
          <ConfigurationActions onBack={onBack} onClose={onClose} onNext={handleNext} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );

  return (
    <>
      {isCreating ? (
        <EuiLoadingSpinner size="xl" />
      ) : (
        renderConfiguration()
      )}
    </>
  );
};

export const TemplateConfigurationWithRouter = withRouter(TemplateConfiguration);
