// Change the personal location here, then run npm run build.
export const LOCATION = 'Kenya';
export const ORIGIN = 'https://devjohn.site';
export const AREAS = ['Kenya', 'Uganda', 'Tanzania', 'Nigeria', 'United States', 'Canada', 'United Kingdom'];
export const SERVICES = ['Full-stack product development', 'API architecture and systems integration', 'E-commerce and payment platforms', 'WhatsApp automation and customer workflows', 'Dashboards and internal operations systems', 'Performance engineering and technical SEO', 'Cloud deployment and DevOps', 'Public sector and civic-tech platforms'];
export function entities() {
  return [
    {'@type':'Person','@id':ORIGIN+'/#john',name:'John Mwaura',alternateName:['Dev John','Dev.John'],jobTitle:'Independent full-stack, web and software developer',url:ORIGIN+'/',image:ORIGIN+'/images/portfolio-photo.png',email:'mwaura.ke.john@gmail.com',sameAs:['https://github.com/MarcusKE-dev','https://linkedin.com/in/john-mwaura-dev'],knowsAbout:SERVICES,worksFor:{'@id':'https://abcsystems.co.ke/#organization'},address:{'@type':'PostalAddress',addressCountry:'KE'}},
    {'@type':'WebSite','@id':ORIGIN+'/#website',name:'Dev John',alternateName:['John Mwaura'],url:ORIGIN+'/',inLanguage:'en',publisher:{'@id':ORIGIN+'/#john'}},
    {'@type':['ProfessionalService','Service'],'@id':ORIGIN+'/#business',name:'Dev John',url:ORIGIN+'/',image:ORIGIN+'/images/portfolio-photo.png',provider:{'@id':ORIGIN+'/#john'},serviceType:SERVICES,areaServed:AREAS.map(name=>({'@type':'Country',name})),priceRange:'KSh 10,000+ / $100+',email:'mwaura.ke.john@gmail.com',telephone:'+254741104469',address:{'@type':'PostalAddress',addressCountry:'KE'}},
    {'@type':'Organization','@id':'https://abcsystems.co.ke/#organization',name:'ABC Systems',url:'https://abcsystems.co.ke',founder:{'@id':ORIGIN+'/#john'},address:{'@type':'PostalAddress',addressCountry:'KE',addressLocality:'Nairobi'}}
  ];
}
