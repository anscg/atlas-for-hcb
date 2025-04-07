import { useEffect } from 'react';

const useA10StyleInjector = () => {
  useEffect(() => {
    const addClassesToA10Elements = () => {
      const allElements = document.querySelectorAll('[data-silk]');
      
      // Loop through each element
      allElements.forEach(element => {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          
          if (attr.name.startsWith('data-silk') && 
              attr.value && 
              attr.value.startsWith('a10')) {
            
            // Add our classes
            element.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
            break;
          }
        }
      });
    };

    addClassesToA10Elements();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          addClassesToA10Elements();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);
};

export default useA10StyleInjector;