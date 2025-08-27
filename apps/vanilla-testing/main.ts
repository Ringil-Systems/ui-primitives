import { Accordion, Checkbox, Dialog, DropdownMenu, Label, RadioGroup, Separator } from '@radix-ui/vanilla';

// Initialize accordion
const accordionElement = document.getElementById('accordion') as HTMLElement;
const accordion = new Accordion(accordionElement, {
  type: 'single',
  defaultValue: 'one',
  onValueChange: (value) => {
    console.log('Accordion value changed:', value);
  }
});

// Initialize multiple accordion
const multipleAccordionElement = document.getElementById('multiple-accordion') as HTMLElement;
const multipleAccordion = new Accordion(multipleAccordionElement, {
  type: 'multiple',
  defaultValue: ['a'],
  onValueChange: (value) => {
    console.log('Multiple accordion value changed:', value);
  }
});

// Initialize dialog
const dialogElement = document.querySelector('[data-dialog-overlay]') as HTMLElement;
const dialog = new Dialog(dialogElement, {
  defaultOpen: false,
  modal: true,
  onOpenChange: (open) => {
    console.log('Dialog open state changed:', open);
  },
  onEscapeKeyDown: (event) => {
    console.log('Escape key pressed');
  },
  onPointerDownOutside: (event) => {
    console.log('Clicked outside dialog');
  }
});

// Initialize dropdown menu
const dropdownMenuElement = document.getElementById('dropdown-menu') as HTMLElement;
const dropdownMenu = new DropdownMenu(dropdownMenuElement, {
  defaultOpen: false,
  modal: true,
  onOpenChange: (open) => {
    console.log('Dropdown menu open state changed:', open);
  },
  onEscapeKeyDown: (event) => {
    console.log('Escape key pressed on dropdown');
  }
});

// Initialize checkbox
const checkboxElement = document.getElementById('checkbox') as HTMLElement;
const checkbox = new Checkbox(checkboxElement, {
  defaultChecked: false,
  onCheckedChange: (checked) => {
    console.log('Checkbox state changed:', checked);
  }
});

// Initialize label
const labelElement = document.getElementById('label') as HTMLElement;
const label = new Label(labelElement, {
  htmlFor: 'test-input'
});

// Initialize radio group
const radioGroupElement = document.getElementById('radio-group') as HTMLElement;
const radioGroup = new RadioGroup(radioGroupElement, {
  defaultValue: 'one',
  onValueChange: (value) => {
    console.log('Radio group value changed:', value);
  }
});

// Initialize separators
const separatorHorizontalElement = document.getElementById('separator-horizontal') as HTMLElement;
const separatorHorizontal = new Separator(separatorHorizontalElement, {
  orientation: 'horizontal'
});

const separatorVerticalElement = document.getElementById('separator-vertical') as HTMLElement;
const separatorVertical = new Separator(separatorVerticalElement, {
  orientation: 'vertical'
});

// Make components available globally for testing
(window as any).accordion = accordion;
(window as any).dialog = dialog;
(window as any).multipleAccordion = multipleAccordion;
(window as any).dropdownMenu = dropdownMenu;
(window as any).checkbox = checkbox;
(window as any).label = label;
(window as any).radioGroup = radioGroup;
(window as any).separatorHorizontal = separatorHorizontal;
(window as any).separatorVertical = separatorVertical;

// Add event listeners for demonstration
accordion.addCustomEventListener('itemOpen', (event: CustomEvent) => {
  console.log('Accordion item opened:', event.detail.value);
});

accordion.addCustomEventListener('itemClose', (event: CustomEvent) => {
  console.log('Accordion item closed:', event.detail.value);
});

dialog.addCustomEventListener('open', () => {
  console.log('Dialog opened');
});

dialog.addCustomEventListener('close', () => {
  console.log('Dialog closed');
});

dropdownMenu.addCustomEventListener('open', () => {
  console.log('Dropdown menu opened');
});

dropdownMenu.addCustomEventListener('close', () => {
  console.log('Dropdown menu closed');
});

dropdownMenu.addCustomEventListener('select', (event: CustomEvent) => {
  console.log('Dropdown menu item selected:', event.detail.value);
});

checkbox.addCustomEventListener('checkedChange', (event: CustomEvent) => {
  console.log('Checkbox checked changed:', event.detail.checked);
});

radioGroup.addCustomEventListener('valueChange', (event: CustomEvent) => {
  console.log('Radio group value changed:', event.detail.value);
});

console.log('Vanilla JS UI Primitives initialized!');
console.log('Available components:', { 
  accordion, 
  dialog, 
  multipleAccordion, 
  dropdownMenu, 
  checkbox, 
  label, 
  radioGroup,
  separatorHorizontal, 
  separatorVertical 
});
