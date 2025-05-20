import React, { useEffect, useState } from 'react';
import { EuiFormRow, EuiComboBox } from '@elastic/eui';
import { IndexOption } from '../types';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../../common';

interface JudgmentSetsComboBoxProps {
  selectedOptions: JudgmentSetOption[];
  onChange: (selectedOptions: JudgmentSetOption[]) => void;
  http: CoreStart['http'];
}

export const JudgmentSetsComboBox = ({
  selectedOptions,
  onChange,
  http,
}: JudgmentSetsComboBoxProps) => {
  const [judgmentSetOptions, setJudgmentSetOptions] = useState<IndexOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJudgmentSets = async () => {
      try {
        const data = await http.get(ServiceEndpoints.Judgments);
        const options = data.hits.hits.map((judgmentSet: any) => ({
          label: judgmentSet._source.name,
          value: judgmentSet._source.id,
        }));
        setJudgmentSetOptions(options);
      } catch (error) {
        console.error('Failed to fetch judgment sets', error);
        setJudgmentSetOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJudgmentSets();
  }, [http]);

  return (
    <EuiFormRow label="Judgment Sets">
      <EuiComboBox
        placeholder={isLoading ? 'Loading...' : 'Select judgment sets'}
        options={judgmentSetOptions}
        selectedOptions={selectedOptions}
        onChange={onChange}
        isClearable
        isInvalid={selectedOptions.length === 0}
        singleSelection={{ asPlainText: true }}
        isLoading={isLoading}
        async
        fullWidth
      />
    </EuiFormRow>
  );
};
