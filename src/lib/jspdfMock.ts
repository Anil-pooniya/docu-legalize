
// This is a simple mock for jsPDF to resolve TypeScript errors
// In a real implementation, you would install and use the actual jsPDF library

export default class jsPDF {
  constructor(options?: any) {
    // Mock implementation
    console.log('Creating jsPDF instance with options:', options);
  }

  text(text: string, x: number, y: number, options?: any) {
    // Mock implementation
    console.log(`Adding text: "${text}" at (${x}, ${y})`, options);
    return this;
  }

  addPage() {
    // Mock implementation
    console.log('Adding new page');
    return this;
  }

  save(filename: string) {
    // Mock implementation
    console.log(`Saving PDF as ${filename}`);
    return this;
  }

  html(element: HTMLElement | string, options?: any) {
    // Mock implementation
    console.log('Converting HTML to PDF', element, options);
    
    // If options.callback is provided, execute it with this instance
    if (options && typeof options.callback === 'function') {
      setTimeout(() => {
        options.callback(this);
      }, 100);
    }
    
    // Return a promise for compatibility with promise-based usage
    return new Promise<jsPDF>((resolve) => {
      setTimeout(() => {
        console.log('HTML converted to PDF');
        resolve(this);
      }, 100);
    });
  }

  output(type: string) {
    // Mock implementation
    console.log(`Outputting PDF as ${type}`);
    return '';
  }
}
