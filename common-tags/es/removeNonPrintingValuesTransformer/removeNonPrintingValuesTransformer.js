'use strict';

import _Number$isNaN from 'babel-runtime/core-js/number/is-nan';
var isValidValue = function isValidValue(x) {
  return x != null && !_Number$isNaN(x) && typeof x !== 'boolean';
};

var removeNonPrintingValuesTransformer = function removeNonPrintingValuesTransformer() {
  return {
    onSubstitution: function onSubstitution(substitution) {
      if (Array.isArray(substitution)) {
        return substitution.filter(isValidValue);
      }
      if (isValidValue(substitution)) {
        return substitution;
      }
      return '';
    }
  };
};

export default removeNonPrintingValuesTransformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyL3JlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXIuanMiXSwibmFtZXMiOlsiaXNWYWxpZFZhbHVlIiwieCIsInJlbW92ZU5vblByaW50aW5nVmFsdWVzVHJhbnNmb3JtZXIiLCJvblN1YnN0aXR1dGlvbiIsInN1YnN0aXR1dGlvbiIsIkFycmF5IiwiaXNBcnJheSIsImZpbHRlciJdLCJtYXBwaW5ncyI6IkFBQUE7OztBQUVBLElBQU1BLGVBQWUsU0FBZkEsWUFBZSxDQUFDQyxDQUFEO0FBQUEsU0FDbkJBLEtBQUssSUFBTCxJQUNBLENBQUMsY0FBYUEsQ0FBYixDQURELElBRUEsT0FBT0EsQ0FBUCxLQUFhLFNBSE07QUFBQSxDQUFyQjs7QUFLQSxJQUFNQyxxQ0FBcUMsU0FBckNBLGtDQUFxQztBQUFBLFNBQU87QUFDaERDLGtCQURnRCwwQkFDaENDLFlBRGdDLEVBQ2xCO0FBQzVCLFVBQUlDLE1BQU1DLE9BQU4sQ0FBY0YsWUFBZCxDQUFKLEVBQWlDO0FBQy9CLGVBQU9BLGFBQWFHLE1BQWIsQ0FBb0JQLFlBQXBCLENBQVA7QUFDRDtBQUNELFVBQUlBLGFBQWFJLFlBQWIsQ0FBSixFQUFnQztBQUM5QixlQUFPQSxZQUFQO0FBQ0Q7QUFDRCxhQUFPLEVBQVA7QUFDRDtBQVQrQyxHQUFQO0FBQUEsQ0FBM0M7O0FBWUEsZUFBZUYsa0NBQWYiLCJmaWxlIjoicmVtb3ZlTm9uUHJpbnRpbmdWYWx1ZXNUcmFuc2Zvcm1lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBpc1ZhbGlkVmFsdWUgPSAoeCkgPT5cbiAgeCAhPSBudWxsICYmXG4gICFOdW1iZXIuaXNOYU4oeCkgJiZcbiAgdHlwZW9mIHggIT09ICdib29sZWFuJ1xuXG5jb25zdCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyID0gKCkgPT4gKHtcbiAgb25TdWJzdGl0dXRpb24gKHN1YnN0aXR1dGlvbikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHN1YnN0aXR1dGlvbikpIHtcbiAgICAgIHJldHVybiBzdWJzdGl0dXRpb24uZmlsdGVyKGlzVmFsaWRWYWx1ZSlcbiAgICB9XG4gICAgaWYgKGlzVmFsaWRWYWx1ZShzdWJzdGl0dXRpb24pKSB7XG4gICAgICByZXR1cm4gc3Vic3RpdHV0aW9uXG4gICAgfVxuICAgIHJldHVybiAnJ1xuICB9XG59KVxuXG5leHBvcnQgZGVmYXVsdCByZW1vdmVOb25QcmludGluZ1ZhbHVlc1RyYW5zZm9ybWVyXG4iXX0=