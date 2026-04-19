export interface NavItem {
  /** Fully-qualified message key — e.g. `nav.consulting` or `nav.dropdown.businessConsulting`. */
  labelKey: string
  href: string
  children?: NavItem[]
  division?: 'consulting' | 'marketing'
}

export const mainNavItems: NavItem[] = [
  {
    labelKey: 'nav.consulting',
    href: '/consulting',
    division: 'consulting',
    children: [
      { labelKey: 'nav.dropdown.businessConsulting', href: '/consulting/business-consulting' },
      { labelKey: 'nav.dropdown.workflowRestructuring', href: '/consulting/workflow-restructuring' },
      { labelKey: 'nav.dropdown.itSystems', href: '/consulting/it-systems' },
      { labelKey: 'nav.dropdown.aiConsulting', href: '/consulting/ai-consulting' },
    ],
  },
  {
    labelKey: 'nav.marketing',
    href: '/marketing',
    division: 'marketing',
    children: [
      { labelKey: 'nav.dropdown.webDesign', href: '/marketing/web-design' },
      { labelKey: 'nav.dropdown.socialMedia', href: '/marketing/social-media' },
      { labelKey: 'nav.dropdown.itInfrastructure', href: '/marketing/it-infrastructure' },
      { labelKey: 'nav.dropdown.aiDevelopment', href: '/marketing/ai-development' },
    ],
  },
  { labelKey: 'nav.about', href: '/about' },
  { labelKey: 'nav.blog', href: '/blog' },
  { labelKey: 'nav.contact', href: '/contact' },
]

export const footerNavItems = {
  consulting: [
    { labelKey: 'nav.dropdown.businessConsulting', href: '/consulting/business-consulting' },
    { labelKey: 'nav.dropdown.workflowRestructuring', href: '/consulting/workflow-restructuring' },
    { labelKey: 'nav.dropdown.itSystems', href: '/consulting/it-systems' },
    { labelKey: 'nav.dropdown.aiConsulting', href: '/consulting/ai-consulting' },
  ],
  marketing: [
    { labelKey: 'nav.dropdown.webDesign', href: '/marketing/web-design' },
    { labelKey: 'nav.dropdown.socialMedia', href: '/marketing/social-media' },
    { labelKey: 'nav.dropdown.itInfrastructure', href: '/marketing/it-infrastructure' },
    { labelKey: 'nav.dropdown.aiDevelopment', href: '/marketing/ai-development' },
  ],
  company: [
    { labelKey: 'footer.company.about', href: '/about' },
    { labelKey: 'footer.company.blog', href: '/blog' },
    { labelKey: 'footer.company.contact', href: '/contact' },
    { labelKey: 'footer.company.privacy', href: '/privacy' },
  ],
}
