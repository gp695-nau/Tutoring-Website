import professorImg1 from "@assets/stock_images/professional_male_pr_81e546a5.jpg";
import professorImg2 from "@assets/stock_images/professional_female__acc4c11e.jpg";
import professorImg3 from "@assets/stock_images/professional_male_pr_cfe5304a.jpg";
import professorImg4 from "@assets/stock_images/professional_female__56a22deb.jpg";
import professorImg5 from "@assets/stock_images/professional_male_pr_22989faf.jpg";
import professorImg6 from "@assets/stock_images/professional_female__c27c1231.jpg";

const professorImages = [
  professorImg1,
  professorImg2,
  professorImg3,
  professorImg4,
  professorImg5,
  professorImg6,
];

export function getProfessorImage(tutorId: string): string {
  const hash = tutorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return professorImages[hash % professorImages.length];
}

export { professorImages };
