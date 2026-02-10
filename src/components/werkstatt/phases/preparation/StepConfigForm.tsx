import { MissingValuesForm } from './MissingValuesForm';
import { OutlierRemovalForm } from './OutlierRemovalForm';
import { EncodingForm } from './EncodingForm';
import { ScalingForm } from './ScalingForm';
import { FeatureSelectionForm } from './FeatureSelectionForm';
import { TrainTestSplitForm } from './TrainTestSplitForm';
import type { PipelineStep, PipelineStepType, PreparedDataSummary } from '@/engine/types';

interface StepConfigFormProps {
  stepType: PipelineStepType;
  dataSummary: PreparedDataSummary;
  isApplying: boolean;
  hasSplit: boolean;
  onApply: (step: PipelineStep) => void;
}

export function StepConfigForm({ stepType, dataSummary, isApplying, hasSplit, onApply }: StepConfigFormProps) {
  switch (stepType) {
    case 'missing-values':
      return <MissingValuesForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'outlier-removal':
      return <OutlierRemovalForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'encoding':
      return <EncodingForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'scaling':
      return <ScalingForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'feature-selection':
      return <FeatureSelectionForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'train-test-split':
      return <TrainTestSplitForm dataSummary={dataSummary} isApplying={isApplying} hasSplit={hasSplit} onApply={onApply} />;
    default:
      return null;
  }
}
