type BreadcrumbType = 'NAVIGATE' | 'CLICK' | 'ACTION' | 'SYNC' | 'ERROR';

interface Breadcrumb {
  type: BreadcrumbType;
  message: string;
  data?: any;
  timestamp: string;
}

const MAX_BREADCRUMBS = 20;
let breadcrumbs: Breadcrumb[] = [];

export const Breadcrumbs = {
  add(type: BreadcrumbType, message: string, data?: any) {
    const newBreadcrumb: Breadcrumb = {
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    
    breadcrumbs.push(newBreadcrumb);
    if (breadcrumbs.length > MAX_BREADCRUMBS) {
      breadcrumbs.shift();
    }
  },

  get() {
    return [...breadcrumbs];
  },

  clear() {
    breadcrumbs = [];
  }
};
