/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 ******************************************************************************************************************** */
/** @jsxImportSource @emotion/react */
import Button from '@cloudscape-design/components/button';
import ButtonDropdown, { ButtonDropdownProps } from '@cloudscape-design/components/button-dropdown';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import { CancelableEventHandler } from '@cloudscape-design/components/internal/events';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextContent from '@cloudscape-design/components/text-content';
import { css } from '@emotion/react';
import { ReactNode, FC, useMemo, useState, useEffect, useCallback } from 'react';
import ExpandableToken from './components/ExpandableToken';
import Token from './components/Token';
import { useGlobalSetupContext } from '../../../contexts/GlobalSetupContext/context';
import { ComposerMode, TemplateThreatStatement, ThreatStatementFormat } from '../../../customTypes';
import { ThreatFieldTypes } from '../../../customTypes/threatFieldTypes';
import threatFieldData from '../../../data/threatFieldData';

import { useReloadedTranslation } from '../../../i18next';
import getRecommendedEditor from '../../../utils/getRecommandedEditor';
import parseThreatStatement from '../../../utils/parseThreatStatement';
import Suggestions from '../Suggestions';


export interface FieldSelectorProps {
  composerMode: ComposerMode;
  currentEditor?: ThreatFieldTypes;
  setEditor: (type: ThreatFieldTypes) => void;
  statement: TemplateThreatStatement;
  suggestions?: string[];
  onGiveExampleClick?: () => void;
  setCustomTemplateEditorVisible: (visible: boolean) => void;
  onStartOver?: () => void;
}

const styles = {
  selector: css({
    lineHeight: '2.5',
  }),
};
const FieldSelector: FC<FieldSelectorProps> = ({
  composerMode,
  onStartOver,
  setEditor,
  currentEditor,
  statement,
  suggestions,
  onGiveExampleClick,
  setCustomTemplateEditorVisible,
}) => {
  const [expandedImpactedGoal, setExpandedImpactedGoal] = useState(false);

  const { t, i18n } = useReloadedTranslation();

  const defaultThreatStatementFormat = (t('THREAT_STATEMENT_FORMAT', { returnObjects: true }) as ThreatStatementFormat)[63];

  useEffect(() => {
    currentEditor === 'impacted_goal' && setExpandedImpactedGoal(true);
  }, [currentEditor]);

  useEffect(() => {
    // Set default to collapse impacted goal when current editing statement change
    setExpandedImpactedGoal(false);
  }, [statement]);

  const { showInfoModal } = useGlobalSetupContext();

  const selector = useMemo(() => {
    let renderShortenImpactedGoal = false;

    let template = statement.customTemplate || defaultThreatStatementFormat.template;
    const outputProcessor = (token: string, content: string, before: string, filled: boolean) => {
      const output: ReactNode[] = [];
      if (token === 'impacted_goal' && !expandedImpactedGoal && !filled && !statement.customTemplate) {
        // If impacted goal is empty, display shorten message.
        output.push(',');
        output.push(
          <ExpandableToken
            key='field_selector_impacted_goal_expand'
            tooltip={`Expand ${threatFieldData[token]?.tooltip}`}
            expanded={false}
            onClick={() => {
              setExpandedImpactedGoal(true);
              setEditor('impacted_goal');
            }}
          />);
        renderShortenImpactedGoal = true;
      } else {
        if (renderShortenImpactedGoal) {
          output.push(`${t('negatively impacting')} `);
        } else {
          output.push(before);
        }

        output.push(<Token
          key={token}
          highlighted={currentEditor === token}
          filled={!!filled}
          tooltip={threatFieldData[token]?.tooltip}
          onClick={() => setEditor(token as ThreatFieldTypes)}>
          {t(content)}
        </Token>);

        token === 'impacted_goal' &&
          !filled &&
          output.push(
            <ExpandableToken
              expanded
              key='field_selector_impacted_goal_collpase'
              tooltip={`Collapse ${threatFieldData[token]?.tooltip}`}
              onClick={() => {
                setExpandedImpactedGoal(false);
                const nextEditor = getRecommendedEditor(statement);
                nextEditor && setEditor(nextEditor);
              }}
            />);
      }

      return output;
    };

    return parseThreatStatement({
      statement,
      template,
      outputProcessor,
    });

  }, [t, i18n.language, statement, setEditor, currentEditor, suggestions, expandedImpactedGoal, setExpandedImpactedGoal]);

  const handleMoreActions: CancelableEventHandler<ButtonDropdownProps.ItemClickDetails> = useCallback(({ detail }) => {
    switch (detail.id) {
      case 'customTemplate':
        setCustomTemplateEditorVisible(true);
        break;
      default:
        console.log('Unknown action', detail.id);
    }
  }, [setCustomTemplateEditorVisible]);

  return (<Container
    header={<Header
      info={composerMode === 'Full' ? undefined : <Button variant='icon' iconName='status-info' onClick={showInfoModal} />}
      actions={<SpaceBetween direction='horizontal' size='s'>
        {composerMode === 'EditorOnly' && <Button onClick={onStartOver}>{t('Start over')}</Button>}
        {onGiveExampleClick && <Button onClick={onGiveExampleClick}>{t('Give me a random example')}</Button>}
        <ButtonDropdown items={[
          { id: 'customTemplate', text: t('Custom Template') },
        ]}
        ariaLabel={t('More actions')}
        onItemClick={handleMoreActions} />
      </SpaceBetween>}
      description={t('Start by clicking ANY field you like and work from there...')}>{t("Let's write a threat statement!")}</Header>}>
    <SpaceBetween direction='vertical' size='s'>
      <TextContent>
        <div css={styles.selector}>
          {selector}
        </div>
      </TextContent>
      <Suggestions suggestions={suggestions} setEditor={setEditor} />
    </SpaceBetween>
  </Container>);
};

export default FieldSelector;
