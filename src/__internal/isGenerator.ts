export default (fn: any) => {
  return (
    typeof fn === 'function' &&
    fn.constructor &&
    fn.constructor.name === 'GeneratorFunction'
  );
};
