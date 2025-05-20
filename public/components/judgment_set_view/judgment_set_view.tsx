/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiCodeBlock,
} from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';

interface JudgmentSetViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const JudgmentSetView: React.FC<JudgmentSetViewProps> = ({ http, id }) => {
  const [judgmentSet, setJudgmentSet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const JudgmentSetViewPane: React.FC = () => {
    const formatJson = (json: string) => {
      try {
        return JSON.stringify(JSON.parse(json), null, 2);
      } catch {
        return json;
      }
    };

    return (
      <EuiForm>
        <EuiFormRow
          label="Judgment Set Name"
          fullWidth
        >
          <EuiText>{judgmentSet.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="Type"
          fullWidth
        >
          <EuiText>{judgmentSet.type}</EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="Metadata"
          fullWidth
        >
          <EuiText>
            {Object.entries(judgmentSet.metadata).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </p>
            ))}
          </EuiText>
        </EuiFormRow>

        <EuiFormRow
          label="JudgmentSetScores"
          fullWidth
        >
          <EuiPanel
            paddingSize="s"
            hasShadow={false}
            style={{ maxHeight: '200px', overflow: 'auto' }}
          >
            <EuiCodeBlock language="json" paddingSize="s" isCopyable>
              {JSON.stringify(judgmentSet.judgmentScores, null, 2)}
            </EuiCodeBlock>
          </EuiPanel>
        </EuiFormRow>
      </EuiForm>


    );
  };

  useEffect(() => {
    const fetchJudgmentSet = async () => {
      try {
        setLoading(true);
        const response = await http.get(ServiceEndpoints.Judgments);
        const list = response ? response.hits.hits.map((hit: any) => ({ ...hit._source })) : [];
        const filteredList = list.filter((item: any) => item.id === id);

        if (filteredList.length > 0) {
          setJudgmentSet(filteredList[0]);
        } else {
          setError('No matching judgment set found');
        }
      } catch (err) {
        setError('Error loading judgment set data');
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJudgmentSet();
  }, [http, id]);

  if (loading) {
    return <div>Loading judgment set data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Judgment Set Details"
        description="View the details of your judgment set"
      />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>
        <JudgmentSetViewPane />
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export default JudgmentSetView;
