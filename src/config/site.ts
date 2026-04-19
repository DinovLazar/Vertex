export const siteConfig = {
  name: "Vertex Consulting",
  legalName: "ВЕРТЕКС КОНСАЛТИНГ ДООЕЛ",
  tagline: "We help businesses grow smarter.",
  domain: "vertexconsulting.mk",
  url: "https://vertexconsulting.mk",
  owner: "Goran Dinov",
  founded: 2018,
  address: {
    street: "Str. Mladinska 43",
    city: "Strumica",
    country: "Macedonia",
  },
  contact: {
    phone: "+389 70 214 033",
    emailInfo: "info@vertexconsulting.mk",
    emailMarketing: "marketing@vertexconsulting.mk",
  },
  hours: "Monday to Friday, 09:00 to 17:00",
  social: {
    linkedin: "https://linkedin.com",
    instagram: "https://www.instagram.com/vertxsystems.mk",
    facebook: "https://www.facebook.com/share/1CEaD21Asq/",
  },
  divisions: {
    consulting: {
      name: "Vertex Consulting",
      manager: "Goran Dinov",
      team: ["Goran Dinov"],
      description:
        "Business consulting, workflow restructuring, IT & systems assistance, AI consulting & tool integration.",
    },
    marketing: {
      name: "Vertex Marketing",
      manager: "Goran Dinov (oversight)",
      team: ["Lazar", "Petar", "Andrej"],
      description:
        "Website design & development, social media management, IT infrastructure, AI-assisted development.",
    },
  },
} as const
