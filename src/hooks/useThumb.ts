import React from 'react';
import {useEvent} from './useEvent';
import useRounding from './useRounding';

type Props = {
  step: number;
  value: number;
  minimumValue: number;
  maximumValue: number;
  slideOnTap: boolean | undefined;
  grabRadius?: number;
  onValueChange?: (value: number) => boolean | void;
};

/** Handle the state of a thumb for a slider */
const useThumb = (props: Props) => {
  const {
    step,
    value: propValue,
    slideOnTap,
    grabRadius,
    minimumValue,
    maximumValue,
    onValueChange,
  } = props;
  const [value, setValue] = React.useState(propValue || minimumValue); // The value desired
  const round = useRounding({step, minimumValue, maximumValue});

  /** Update the thumb value */
  const updateValue = useEvent((newValue: number, fireEvent?: boolean) => {
    const rounded = round(newValue);
    if (rounded === value) return;
    if (!fireEvent || onValueChange?.(rounded) !== false) setValue(rounded);
  });

  const roundValue = useEvent(() => round(value));
  // Update the value on bounds change
  React.useEffect(() => {
    roundValue();
  }, [step, minimumValue, maximumValue, roundValue]);

  // Update the value on propchange
  React.useEffect(() => {
    updateValue(propValue);
  }, [propValue, updateValue]);

  /** Call onValueChange when the user changed the value */
  const userUpdateValue = useEvent((newValue: number) => {
    updateValue(newValue, true);
  });

  /**
   * Indicates whether we accept to move to the specified position.
   * If the position is too far and slideOnTap is not set, we don't accept sliding there
   **/
  const canMove = useEvent((newValue: number, containerSize: number) => {
    // Convert pixel grabRadius to value units if defined
    const valueGrabRadius =
      grabRadius !== undefined
        ? (grabRadius / containerSize) * (maximumValue - minimumValue)
        : undefined;

    if (slideOnTap) {
      // When slideOnTap is true and grabRadius is defined,
      // only allow tapping within the grab radius
      if (valueGrabRadius !== undefined) {
        return Math.abs(newValue - value) <= valueGrabRadius;
      }
      // When slideOnTap is true but no grabRadius, allow tap anywhere
      return true;
    }

    // When slideOnTap is false, use grabRadius or default behavior
    return (
      Math.abs(newValue - value) <
      (valueGrabRadius ?? (step || (maximumValue - minimumValue) / 10 || 1))
    );
  });

  return {updateValue: userUpdateValue, canMove, value};
};

export default useThumb;
