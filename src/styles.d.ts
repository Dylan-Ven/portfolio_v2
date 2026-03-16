// Custom module declaration for importing CSS files
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
