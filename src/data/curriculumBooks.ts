export interface CurriculumLecture {
  name: string;
  url?: string;
  lectureNumber?: number;
}

export interface CurriculumSubject {
  id: string;
  name: string;
  code?: string;
  url?: string;
  fileKey?: string;
  lectures: CurriculumLecture[];
  // Backwards-compatible aliases if referenced elsewhere
  parts?: CurriculumLecture[];
}

export interface CurriculumGrade {
  id: string;
  name: string;
  folderName?: string;
  branch: 'none' | 'scientific' | 'literary';
  subjects: CurriculumSubject[];
}

export interface CurriculumStage {
  id: string;
  name: string;
  color?: string;
  grades: CurriculumGrade[];
}

// ============================================================================
// محاضرات قسم تقنيات الأشعة والتصوير الطبي (المراحل الأربعة المتكاملة)
// كل مادة تضم سلسلة محاضرات أكاديمية مفصلة ومرتبة
// ============================================================================
export const LECTURES_DATA: CurriculumStage[] = [
  {
    id: 'undergrad_radiology',
    name: 'المراحل الجامعية - تقنيات الأشعة والتصوير الطبي',
    color: 'cyan',
    grades: [
      // ----------------------------------------------------------------------
      // المرحلة الأولى: الأساسيات والفيزياء والتشريح
      // ----------------------------------------------------------------------
      {
        id: 'stage_1',
        name: 'المرحلة الأولى',
        folderName: 'stage_1',
        branch: 'none',
        subjects: [
          {
            id: 'rad_phys_1',
            name: 'البايولوجي',
            code: 'RAD101',
            lectures: [
            ],
          },
          {
            id: 'anatomy_1',
            name: 'التشريح',
            code: 'ANAT102',
            lectures: [

            ],
          },
          {
            id: 'physiology_1',
            name: 'الفسلجة',
            code: 'PHYS103',
            lectures: [

            ],
          },
          {
            id: 'med_terms_1',
            name: 'المصطلحات الطبية',
            code: 'TERM104',
            lectures: [

            ],
          },
          {
            id: 'biochem_1',
            name: 'الكيمياء',
            code: 'BIO105',
            lectures: [

            ],
          },
          {
            id: 'informatics_1',
            name: 'الحاسوب',
            code: 'COMP106',
            lectures: [

            ],
          },
          {
            id: 'ethics_1',
            name: 'فيزياء',
            code: 'ETH107',
            lectures: [

            ],
          },
        ],
      },

      // ----------------------------------------------------------------------
      // المرحلة الثانية: الأشعة السينية والتشريح الشعاعي والوقاية
      // ----------------------------------------------------------------------
      {
        id: 'stage_2',
        name: 'المرحلة الثانية',
        folderName: 'stage_2',
        branch: 'none',
        subjects: [
          {
            id: 'xray_tech_2',
            name: 'الاجهزة',
            code: 'RAD201',
            lectures: [

            ],
          },
          {
            id: 'rad_anatomy_2',
            name: 'التشريح الشعاعي',
            code: 'RAD202',
            lectures: [

            ],
          },
          {
            id: 'rad_protection_2',
            name: 'الوقاية الإشعاعية',
            code: 'RAD203',
            lectures: [

            ],
          },
          {
            id: 'rad_equip_2',
            name: 'التصوير',
            code: 'RAD204',
            lectures: [

            ],
          },
          {
            id: 'pathology_2',
            name: 'علم الأمراض',
            code: 'PATH205',
            lectures: [

            ],
          },
          {
            id: 'clinical_train_2',
            name: 'الفحوصات',
            code: 'CLIN206',
            lectures: [

            ],
          },
        ],
      },

      // ----------------------------------------------------------------------
      // المرحلة الثالثة: المفراس والرنين والسونار والقسطرة
      // ----------------------------------------------------------------------
      {
        id: 'stage_3',
        name: 'المرحلة الثالثة',
        folderName: 'stage_3',
        branch: 'none',
        subjects: [
          {
            id: 'ct_scan_3',
            name: ' المفراس',
            code: 'CT301',
            lectures: [

            ],
          },
          {
            id: 'mri_intro_3',
            name: 'الرنين',
            code: 'MRI302',
            lectures: [

            ],
          },
          {
            id: 'ultrasound_3',
            name: 'الموجات فوق الصوتية',
            code: 'US303',
            lectures: [

            ],
          },
          {
            id: 'interventional_3',
            name: 'الأشعة التداخلية',
            code: 'INT304',
            lectures: [

            ],
          },
          {
            id: 'nuclear_med_3',
            name: 'الطب النووي',
            code: 'NUC305',
            lectures: [

            ],
          },
          {
            id: 'patient_care_3',
            name: 'الباثولوجي',
            code: 'CARE306',
            lectures: [
,
            ],
          },
        ],
      },

      // ----------------------------------------------------------------------
      // المرحلة الرابعة: الرنين والمفراس المتقدم والطب النووي وبحوث التخرج
      // ----------------------------------------------------------------------
      {
        id: 'stage_4',
        name: 'المرحلة الرابعة',
        folderName: 'stage_4',
        branch: 'none',
        subjects: [
          {
            id: 'adv_mri_4',
            name: 'محاضرات الباطنية',
            code: 'AMRI401',
            lectures: [
              { name: 'المحاضرة 1', url: 'https://raw.githubusercontent.com/cammeral/xray-book/e711bc1d0b1d5560e2594f0865fd24e837f037f9/s4/%D8%A7%D9%84%D8%A8%D8%A7%D8%B7%D9%86%D9%8A/%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D8%B6%D8%B1%D8%A9%20%D8%A7%D9%84%D8%A7%D9%88%D9%84%D9%89%20%D8%A7%D9%84%D8%A8%D8%A7%D8%B7%D9%86%D9%8A.pdf' },
            ],
          },
          {
            id: 'adv_ct_4',
            name: 'المفراس',
            code: 'ACT402',
            lectures: [
              { name: 'المحاضرة 1', url: 'https://raw.githubusercontent.com/cammeral/xray-book/e711bc1d0b1d5560e2594f0865fd24e837f037f9/s4/%D8%A7%D9%84%D9%85%D9%81%D8%B1%D8%A7%D8%B3/%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D8%B6%D8%B1%D8%A9%20%D8%A7%D9%84%D8%A7%D9%88%D9%84%D9%89%20%D9%85%D9%81%D8%B1%D8%A7%D8%B3.pdf' },
              { name: 'المحاضرة 2', url: 'https://raw.githubusercontent.com/cammeral/xray-book/e711bc1d0b1d5560e2594f0865fd24e837f037f9/s4/%D8%A7%D9%84%D9%85%D9%81%D8%B1%D8%A7%D8%B3/%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D8%B6%D8%B1%D8%A9%20%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D9%81%D8%B1%D8%A7%D8%B3.pdf' },
            ],
          },
          {
            id: 'qa_pacs_4',
            name: 'الرنــــين',
            code: 'QA403',
            lectures: [
              { name: 'المحاضرة 1: معايير وبرامج ضبط وتوكيد الجودة الدولية (QA/QC) لأجهزة الأشعة والمفراس والرنين', url: 'https://drive.google.com' },
            ],
          },
          {
            id: 'radiotherapy_4',
            name: 'السونار',
            code: 'RT404',
            lectures: [
              { name: 'المحاضرة 1: مبادئ العلاج الإشعاعي للأورام وفيزياء المعجلات الخطية (Linear Accelerators - LINAC)', url: 'https://drive.google.com' },
            ],
          },
          {
            id: 'mammography_4',
            name: 'الحاسوب',
            code: 'MAM405',
            lectures: [
              { name: 'المحاضرة 1', url: 'https://raw.githubusercontent.com/cammeral/xray-book/e711bc1d0b1d5560e2594f0865fd24e837f037f9/s4/%D8%A7%D9%84%D8%AD%D8%A7%D8%B3%D9%88%D8%A8/%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D8%B6%D8%B1%D8%A9%20%D8%A7%D9%84%D8%A7%D9%88%D9%84%D9%89%20%D8%A7%D9%84%D8%A7%D9%83%D8%B3%D9%84.pdf' },
            ],
          },
          {
            id: 'grad_project_4',
            name: 'الاحــصاء',
            code: 'RES406',
            lectures: [
              { name: 'المحاضرة 1', url: 'https://raw.githubusercontent.com/cammeral/xray-book/e711bc1d0b1d5560e2594f0865fd24e837f037f9/s4/%D8%A7%D9%84%D8%A7%D8%AD%D8%B5%D8%A7%D8%A1/%D8%A7%D9%84%D8%A7%D8%AD%D8%B5%D8%A7%D8%A1%201.pdf' },
            ],
          },
        ],
      },
    ],
  },
];

// Compatibility alias if any external component imports BOOKS_DATA or HANDOUTS_DATA
export const BOOKS_DATA: CurriculumStage[] = LECTURES_DATA;
export const HANDOUTS_DATA: CurriculumStage[] = LECTURES_DATA;
