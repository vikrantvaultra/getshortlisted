/**
 * Generates a deterministic reference corpus of mock Indian tech resumes.
 *
 *   npx tsx scripts/generate-reference-corpus.ts [--count 46547] [--out ./corpus]
 *
 * These are GENERATED documents, not real resumes. They exist so the phrase
 * index has something to measure against on day one. Everything the product
 * shows about them must say "generated reference resumes".
 *
 * Phrasing is sampled from a Zipf-like distribution: the first templates in
 * each bank are clichés that recur across hundreds of files, the tail is rare.
 * Slot-heavy templates ({tech}, {domain}, numbers) add realistic variation.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ═════════════════════════════════════════════════════════════════════════════
// Phrase banks — ordered most common first
// ═════════════════════════════════════════════════════════════════════════════

const FIRST_NAMES = [
  "Rahul", "Priya", "Amit", "Sneha", "Rohit", "Pooja", "Arjun", "Anjali", "Vikram", "Kavya",
  "Karthik", "Divya", "Siddharth", "Neha", "Aditya", "Shreya", "Harsh", "Ritika", "Manoj", "Swathi",
  "Abhishek", "Meghana", "Suresh", "Lakshmi", "Nikhil", "Aishwarya", "Gaurav", "Bhavana", "Prashant", "Tanvi",
  "Vignesh", "Keerthana", "Ankit", "Nandini", "Deepak", "Ishita", "Sai", "Harini", "Yash", "Mounika",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Reddy", "Patel", "Kumar", "Singh", "Nair", "Iyer", "Gupta", "Rao",
  "Das", "Joshi", "Menon", "Chauhan", "Pillai", "Mishra", "Yadav", "Naidu", "Shetty", "Agarwal",
  "Banerjee", "Kulkarni", "Deshmukh", "Pandey", "Srinivasan", "Bhat", "Tiwari", "Mehta", "Ghosh", "Choudhary",
];
const CITIES = [
  "Bengaluru", "Hyderabad", "Pune", "Chennai", "Noida", "Gurugram", "Mumbai", "Kolkata", "Coimbatore", "Jaipur",
  "Bhubaneswar", "Indore", "Lucknow", "Kochi", "Nagpur", "Visakhapatnam", "Chandigarh", "Bhopal", "Mysuru", "Vijayawada",
];
const COLLEGES = [
  "Vellore Institute of Technology", "SRM Institute of Science and Technology", "JNTU Hyderabad", "Anna University",
  "Visvesvaraya Technological University", "Amity University", "Lovely Professional University", "Manipal Institute of Technology",
  "KIIT Bhubaneswar", "Chandigarh University", "Savitribai Phule Pune University", "GITAM University",
  "Dr. A.P.J. Abdul Kalam Technical University", "Rajiv Gandhi Proudyogiki Vishwavidyalaya", "KL University",
  "Sathyabama Institute of Science and Technology", "Graphic Era University", "Mumbai University", "MAKAUT West Bengal",
  "Osmania University",
];
const DEGREES = [
  "B.Tech in Computer Science and Engineering",
  "B.E. in Computer Science",
  "B.Tech in Information Technology",
  "B.E. in Electronics and Communication Engineering",
  "Bachelor of Computer Applications (BCA)",
  "Master of Computer Applications (MCA)",
  "B.Tech in Electrical and Electronics Engineering",
  "B.Sc in Computer Science",
  "B.E. in Mechanical Engineering",
  "M.Tech in Computer Science",
];
const BOARDS = ["CBSE", "State Board", "ICSE", "Maharashtra State Board", "Board of Intermediate Education, Telangana", "Tamil Nadu State Board", "Karnataka PU Board", "UP Board"];

const SERVICE_COMPANIES = [
  "Tata Consultancy Services", "Infosys", "Wipro", "HCLTech", "Tech Mahindra", "Cognizant", "Capgemini", "Accenture",
  "LTIMindtree", "Mphasis", "Hexaware Technologies", "Persistent Systems", "Zensar Technologies", "Birlasoft", "Coforge",
];
const SMALL_COMPANIES = [
  "a Bengaluru-based startup", "Innovate Softech Pvt. Ltd.", "CodeCraft Solutions", "Nexus IT Services", "BrightMinds Technologies",
  "Sparrow Infotech", "Quantum Leap Labs", "Pixel Orbit Technologies", "Vertex Software Solutions", "Bluestone Digital",
];
const INTERN_PLACES = [
  "Internshala", "a local IT company", "CodeCraft Solutions", "Nexus IT Services", "Sparrow Infotech", "the college incubation centre",
  "BSNL", "DRDO", "Verzeo", "Edureka", "Sparks Foundation", "Pixel Orbit Technologies", "NIELIT", "ISRO",
];

type Track = "web" | "java" | "data" | "ml" | "android" | "qa" | "cloud" | "support";

const TRACK_WEIGHTS: [Track, number][] = [
  ["web", 26], ["java", 20], ["data", 15], ["ml", 11], ["qa", 8], ["android", 7], ["cloud", 7], ["support", 6],
];

const TRACK_ROLES: Record<Track, string[]> = {
  web: ["Software Engineer", "Frontend Developer", "Full Stack Developer", "Web Developer", "Associate Software Engineer"],
  java: ["Java Developer", "Software Engineer", "Backend Developer", "Associate Consultant", "Systems Engineer"],
  data: ["Data Analyst", "Business Analyst", "MIS Executive", "Associate Data Analyst", "Analyst"],
  ml: ["Machine Learning Engineer", "Data Scientist", "AI Engineer", "Associate Data Scientist"],
  android: ["Android Developer", "Mobile Application Developer", "Software Developer"],
  qa: ["QA Engineer", "Software Test Engineer", "Test Analyst", "Automation Test Engineer"],
  cloud: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer", "Associate Cloud Engineer"],
  support: ["Technical Support Engineer", "Application Support Analyst", "IT Support Engineer", "Production Support Engineer"],
};

const TECH: Record<Track, string[]> = {
  web: ["React", "React.js", "Angular", "Node.js", "Express.js", "MongoDB", "HTML, CSS and JavaScript", "Next.js", "Tailwind CSS", "TypeScript", "Vue.js", "Bootstrap", "Redux", "PHP and MySQL", "Django"],
  java: ["Java", "Spring Boot", "Hibernate", "MySQL", "Spring MVC", "REST APIs", "JDBC", "Microservices", "PostgreSQL", "Maven", "Kafka", "JUnit", "Oracle SQL", "J2EE", "Redis"],
  data: ["Python", "SQL", "Power BI", "Tableau", "Excel", "Pandas", "MySQL", "Advanced Excel", "NumPy", "Google Data Studio", "Matplotlib", "Looker", "PostgreSQL", "VBA", "Seaborn"],
  ml: ["Python", "TensorFlow", "Scikit-learn", "Keras", "PyTorch", "OpenCV", "NLTK", "Pandas", "Flask", "Hugging Face Transformers", "CNN", "LSTM", "XGBoost", "Streamlit", "spaCy"],
  android: ["Kotlin", "Java", "Android Studio", "Firebase", "Jetpack Compose", "Retrofit", "Room Database", "MVVM architecture", "Flutter", "XML layouts", "Dart", "SQLite", "Google Maps API", "Coroutines", "Dagger Hilt"],
  qa: ["Selenium WebDriver", "TestNG", "Java", "JIRA", "Postman", "Cucumber", "Appium", "Rest Assured", "Maven", "Jenkins", "Page Object Model", "SQL", "Katalon Studio", "Cypress", "Playwright"],
  cloud: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Linux", "Azure", "Ansible", "Git", "GitHub Actions", "EC2 and S3", "Prometheus and Grafana", "Bash scripting", "Helm", "Google Cloud Platform"],
  support: ["ServiceNow", "Linux", "SQL", "Windows Server", "Active Directory", "JIRA", "Shell scripting", "Splunk", "Remedy", "Office 365", "Networking", "ITIL processes", "Putty", "WinSCP", "Unix"],
};

const DOMAINS = [
  "e-commerce", "banking", "healthcare", "insurance", "retail", "telecom", "education", "logistics", "fintech", "travel",
  "real estate", "food delivery", "manufacturing", "agriculture", "HR", "hospitality",
];

const OBJECTIVES = [
  "Seeking a challenging position in a reputed organisation where I can utilise my skills and knowledge for the growth of the organisation.",
  "To work in a challenging environment that provides opportunities for learning and growth while contributing to the success of the organisation.",
  "Looking for an opportunity to work in a dynamic organisation where I can enhance my skills and contribute to the company's growth.",
  "To secure a position as a {role} in a reputed company where I can apply my technical skills and grow professionally.",
  "Hard working and quick learner with good communication skills, looking for an entry level role in the IT industry.",
  "A motivated and detail oriented {degreeShort} graduate eager to start my career as a {role} in a growth oriented organisation.",
  "To be a part of an organisation where I can learn new technologies and contribute my best to achieve the organisational goals.",
  "Aspiring {role} having good knowledge of {tech} and a strong passion for building real world applications.",
  "Enthusiastic fresher with strong problem solving skills and a keen interest in {tech}, seeking an opportunity to prove myself.",
  "To obtain a responsible position in a professional environment where my skills and experience will be fully utilised.",
  "Self motivated individual with a positive attitude, willing to learn and adapt to new technologies quickly.",
  "Seeking an entry level position to begin my career in a high level professional environment.",
  "To build a career in {domain} technology where I can use my analytical skills and knowledge of {tech} to solve real problems.",
];

const SUMMARIES = [
  "Results driven {role} with {years} years of experience in designing, developing and maintaining applications using {tech}.",
  "Having {years} years of IT experience in {tech} with good knowledge of the complete software development life cycle.",
  "Experienced in working with cross-functional teams in an Agile environment to deliver high quality software on time.",
  "Proficient in {tech} and {tech2} with hands-on experience in the {domain} domain.",
  "Strong analytical and problem solving skills with the ability to work independently as well as in a team.",
  "Excellent communication and interpersonal skills with experience interacting directly with clients and stakeholders.",
  "Good exposure to Agile Scrum methodology, sprint planning, daily stand-ups and retrospectives.",
  "Quick learner with a proven ability to adapt to new technologies and deliver under tight deadlines.",
  "Currently working as a {role} at {company}, responsible for development and enhancement of client applications.",
  "Passionate about writing clean, maintainable code and following industry best practices.",
  "Hands-on experience in requirement analysis, coding, unit testing, deployment and production support.",
];

/** Cross-track clichés. These should dominate. */
const GENERIC_BULLETS = [
  "Collaborated with cross-functional teams to define, design and ship new features.",
  "Participated in daily stand-up meetings, sprint planning and code reviews as part of an Agile team.",
  "Worked closely with the team to understand requirements and deliver the project on time.",
  "Involved in the complete software development life cycle including requirement gathering, design, development and testing.",
  "Wrote clean, maintainable and well documented code following best practices.",
  "Fixed bugs and resolved production issues reported by the QA team and end users.",
  "Used Git and GitHub for version control and collaborated with team members through pull requests.",
  "Performed unit testing and debugging to ensure the application works as expected.",
  "Gained hands-on experience in {tech} and learned industry best practices.",
  "Prepared technical documentation and presented the project to the team lead and mentors.",
  "Coordinated with the onsite team and clients to understand business requirements.",
  "Improved the performance of the application by {pct}% through code optimisation.",
  "Mentored {n} junior team members and helped them get familiar with the codebase.",
  "Received appreciation from the client for timely delivery and quality of work.",
  "Actively participated in knowledge transfer sessions and internal trainings.",
  "Worked on enhancements and change requests as per client requirements.",
  "Followed Agile methodology and used JIRA for tracking tasks and bugs.",
  "Completed the internship successfully and received a certificate of completion.",
  "Done my internship in {tech} where I learned how real world projects are developed.",
  "Reduced manual effort by {pct}% by automating repetitive tasks using {tech}.",
];

const TRACK_BULLETS: Record<Track, string[]> = {
  web: [
    "Developed a responsive web application using React and Node.js with a clean and user friendly interface.",
    "Designed and developed responsive web pages using HTML, CSS, JavaScript and Bootstrap.",
    "Built RESTful APIs using Node.js and Express.js and integrated them with the frontend.",
    "Implemented user authentication and authorization using JWT tokens.",
    "Created reusable UI components in {tech} which reduced development time for the team.",
    "Integrated third party APIs such as payment gateway and Google Maps into the application.",
    "Used MongoDB as the database to store user details and application data.",
    "Ensured cross browser compatibility and mobile responsiveness of all web pages.",
    "Optimised page load time by {pct}% using lazy loading and code splitting.",
    "Deployed the application on {host} and configured continuous deployment from GitHub.",
    "Implemented state management using Redux to handle complex application state.",
    "Worked on the admin dashboard of a {domain} platform using {tech} and {tech2}.",
    "Converted Figma designs into pixel perfect and responsive {tech} components.",
    "Implemented form validations and error handling to improve the user experience.",
    "Built a real time chat feature using Socket.io for {n}+ concurrent users.",
    "Improved the Lighthouse performance score from {n2} to {n3} by optimising images and bundles.",
    "Migrated legacy jQuery pages to {tech} which improved maintainability of the codebase.",
    "Wrote unit tests using Jest and React Testing Library to achieve {pct}% code coverage.",
    "Implemented role based access control for admin, vendor and customer users.",
    "Developed a CMS driven marketing website for a {domain} client serving {n}K monthly visitors.",
  ],
  java: [
    "Developed RESTful web services using Spring Boot and integrated them with a MySQL database.",
    "Designed and implemented microservices using Spring Boot for a {domain} application.",
    "Wrote complex SQL queries, stored procedures and triggers for data retrieval and reporting.",
    "Implemented the DAO layer using Hibernate and Spring Data JPA.",
    "Handled exception handling and logging using Log4j across the application modules.",
    "Wrote JUnit and Mockito test cases to improve code coverage of the service layer.",
    "Worked on bug fixing and enhancements of a legacy J2EE application for a {domain} client.",
    "Integrated Kafka for asynchronous communication between microservices.",
    "Implemented Spring Security with JWT for securing REST endpoints.",
    "Optimised slow running database queries which reduced API response time by {pct}%.",
    "Developed batch jobs using Spring Batch to process {n}K records daily.",
    "Used Swagger for API documentation and Postman for API testing.",
    "Participated in the migration of a monolithic application to a microservices architecture.",
    "Implemented caching using Redis to reduce database load during peak hours.",
    "Created a Jenkins pipeline for building and deploying the application to the test environment.",
    "Worked on the {domain} module handling customer onboarding and KYC verification.",
    "Built an inventory management system using Java, JDBC and MySQL as an academic project.",
    "Resolved {n}+ production defects within SLA as part of the maintenance team.",
    "Applied object oriented principles and design patterns such as Singleton and Factory.",
    "Developed a library management system in core Java with file handling and collections.",
  ],
  data: [
    "Created interactive dashboards in Power BI to track key business metrics for management.",
    "Performed data cleaning, data transformation and exploratory data analysis using Python and Pandas.",
    "Wrote SQL queries to extract, filter and analyse data from large datasets.",
    "Analysed sales data and identified trends which helped the team take data driven decisions.",
    "Automated weekly MIS reports using Advanced Excel and VBA macros, saving {n} hours every week.",
    "Built Tableau dashboards to visualise customer churn and retention for a {domain} client.",
    "Used pivot tables, VLOOKUP and conditional formatting to prepare reports in Excel.",
    "Performed exploratory data analysis on a {domain} dataset with {n}K+ records.",
    "Presented insights and recommendations to stakeholders through clear visualisations.",
    "Designed KPIs and metrics in consultation with the business team.",
    "Cleaned and merged data from multiple sources ensuring data accuracy and consistency.",
    "Conducted A/B test analysis for the marketing team and reported statistically significant results.",
    "Built a customer segmentation analysis using RFM technique on transaction data.",
    "Reduced report preparation time by {pct}% by moving reports from Excel to Power BI.",
    "Wrote Python scripts to automate data extraction from Google Sheets and APIs.",
    "Analysed the IPL dataset to find insights on team and player performance.",
    "Worked on data validation and quality checks for the monthly regulatory reports.",
    "Performed cohort analysis to understand user behaviour across {n} months.",
  ],
  ml: [
    "Built a machine learning model to predict {target} with {acc}% accuracy.",
    "Performed data preprocessing, feature engineering and model training using Scikit-learn.",
    "Developed a CNN based image classification model using TensorFlow and Keras.",
    "Implemented sentiment analysis on Twitter data using NLP techniques and NLTK.",
    "Compared multiple algorithms like Logistic Regression, Random Forest and XGBoost to select the best model.",
    "Deployed the trained model as a REST API using Flask and hosted it on {host}.",
    "Used OpenCV to build a real time face detection and recognition system.",
    "Tuned hyperparameters using GridSearchCV which improved model accuracy by {pct}%.",
    "Built a chatbot using Python and NLP to answer frequently asked questions.",
    "Worked on a fake news detection model using TF-IDF and Passive Aggressive Classifier.",
    "Fine-tuned a BERT model for text classification on a custom {domain} dataset.",
    "Built a movie recommendation system using collaborative filtering.",
    "Created a Streamlit web app for users to interact with the prediction model.",
    "Developed a crop disease detection model using transfer learning on {n}K leaf images.",
    "Evaluated models using precision, recall, F1 score and confusion matrix.",
    "Built a retrieval augmented chatbot over internal documents using LangChain and a vector database.",
    "Implemented an LSTM model for stock price prediction using historical data.",
  ],
  android: [
    "Developed an Android application using Java and Android Studio with Firebase as backend.",
    "Built the app using Kotlin following MVVM architecture and Jetpack components.",
    "Integrated Firebase Authentication, Firestore and push notifications into the app.",
    "Consumed REST APIs using Retrofit and displayed data using RecyclerView.",
    "Implemented offline support using Room database for a smooth user experience.",
    "Published the application on the Google Play Store with {n}K+ downloads.",
    "Designed intuitive UI screens using XML layouts and Material Design guidelines.",
    "Integrated Google Maps API to show nearby locations and live tracking.",
    "Reduced app crash rate by {pct}% by fixing issues reported in Firebase Crashlytics.",
    "Developed a cross platform mobile app using Flutter and Dart for a {domain} client.",
    "Implemented in-app payments using Razorpay payment gateway.",
    "Wrote unit tests and UI tests using JUnit and Espresso.",
    "Migrated the UI from XML layouts to Jetpack Compose for better maintainability.",
    "Built a college attendance app used by {n}+ students of our department.",
    "Implemented background location updates using WorkManager and foreground services.",
  ],
  qa: [
    "Prepared test cases, test scenarios and test data based on the requirement documents.",
    "Performed functional, regression, smoke and sanity testing of web applications.",
    "Developed automation test scripts using Selenium WebDriver with Java and TestNG.",
    "Logged, tracked and verified defects using JIRA until closure.",
    "Designed a hybrid automation framework using Page Object Model and TestNG.",
    "Performed API testing using Postman and automated API tests using Rest Assured.",
    "Executed {n}+ test cases per sprint and reported test results to the QA lead.",
    "Integrated automation test suites with Jenkins for nightly regression runs.",
    "Wrote BDD test scenarios using Cucumber and Gherkin language.",
    "Performed mobile application testing on Android and iOS devices using Appium.",
    "Reduced regression testing time by {pct}% by automating repetitive manual test cases.",
    "Participated in requirement review meetings to identify testable requirements early.",
    "Performed database testing by writing SQL queries to validate backend data.",
    "Conducted cross browser testing on Chrome, Firefox and Edge.",
    "Prepared the requirement traceability matrix and daily status reports.",
  ],
  cloud: [
    "Deployed and managed applications on AWS services like EC2, S3, RDS and IAM.",
    "Containerised applications using Docker and deployed them on Kubernetes clusters.",
    "Created and maintained CI/CD pipelines using Jenkins and GitHub Actions.",
    "Wrote Terraform scripts to provision cloud infrastructure as code.",
    "Monitored application health using Prometheus and Grafana dashboards.",
    "Automated server configuration using Ansible playbooks across {n}+ servers.",
    "Wrote shell scripts to automate routine Linux administration tasks.",
    "Reduced monthly cloud cost by {pct}% by rightsizing instances and cleaning unused resources.",
    "Configured load balancers and auto scaling groups to handle peak traffic.",
    "Managed Git branching strategy and resolved merge conflicts for the development team.",
    "Set up centralised logging using the ELK stack for faster troubleshooting.",
    "Handled on-call rotation and resolved production incidents within SLA.",
    "Migrated on-premise applications to Azure with minimal downtime.",
    "Implemented Helm charts for deploying microservices to different environments.",
    "Hosted a static website on AWS S3 with CloudFront as part of a cloud computing project.",
  ],
  support: [
    "Provided L1 and L2 support for enterprise applications and resolved tickets within SLA.",
    "Handled incident, problem and change management using ServiceNow as per ITIL processes.",
    "Monitored batch jobs and application logs and escalated critical issues to the L3 team.",
    "Resolved {n}+ tickets per month with a customer satisfaction score of {acc}%.",
    "Troubleshot hardware, software and network issues for end users.",
    "Wrote SQL queries to analyse data issues and provide fixes for production problems.",
    "Created knowledge base articles for recurring issues which reduced ticket volume.",
    "Performed user account management and access provisioning in Active Directory.",
    "Coordinated with vendors and development teams for root cause analysis.",
    "Participated in the weekly service review calls with the client.",
    "Automated daily health check reports using shell scripts.",
    "Provided 24x7 rotational shift support for a {domain} client application.",
  ],
};

const PROJECT_TITLES: Record<Track, string[]> = {
  web: ["E-Commerce Website", "Online Food Ordering System", "Portfolio Website", "Blog Application (MERN Stack)", "Hospital Management System", "Online Examination Portal", "Real Time Chat Application", "Job Portal Website", "Weather App", "Event Management System", "Expense Tracker", "Online Bus Ticket Booking System"],
  java: ["Library Management System", "Banking Application", "Employee Management System", "Online Voting System", "Student Management System", "Hotel Reservation System", "Inventory Management System", "Railway Reservation System", "Payroll Management System"],
  data: ["Sales Dashboard using Power BI", "Customer Churn Analysis", "IPL Data Analysis", "HR Analytics Dashboard", "Zomato Restaurant Data Analysis", "COVID-19 Data Analysis", "Superstore Sales Analysis", "Credit Card Fraud Analysis", "Swiggy Sales Insights Dashboard"],
  ml: ["House Price Prediction", "Fake News Detection", "Face Recognition Attendance System", "Movie Recommendation System", "Sentiment Analysis on Tweets", "Diabetes Prediction using Machine Learning", "Crop Disease Detection", "Handwritten Digit Recognition", "Resume Screening using NLP", "Stock Price Prediction using LSTM"],
  android: ["College Attendance App", "Expense Manager App", "Grocery Delivery App", "Quiz App", "Women Safety App", "Notes App with Firebase", "Bus Tracking App", "Weather Forecast App"],
  qa: ["Automation Framework for E-Commerce Website", "API Automation using Rest Assured", "Test Automation for Banking Portal", "Mobile App Testing with Appium", "Selenium Framework for Online Booking"],
  cloud: ["CI/CD Pipeline for Web Application", "Deploying Microservices on Kubernetes", "Infrastructure as Code with Terraform", "Serverless Image Processing on AWS", "Monitoring Stack with Prometheus and Grafana"],
  support: ["IT Asset Management Tool", "Helpdesk Ticketing System", "Network Monitoring Script", "Automated Server Health Check"],
};

const HOSTS = ["Vercel", "Netlify", "Heroku", "AWS EC2", "Render", "Firebase Hosting", "Railway", "Azure App Service"];
const ML_TARGETS = ["house prices", "customer churn", "loan approval", "diabetes risk", "student performance", "employee attrition", "credit card fraud", "heart disease"];

const CERTIFICATIONS = [
  "Python for Everybody Specialization by University of Michigan on Coursera",
  "NPTEL certification in Programming in Java (Elite)",
  "AWS Certified Cloud Practitioner",
  "Infosys Springboard certification in Java Programming",
  "HackerRank certification in Problem Solving (Basic)",
  "Google Data Analytics Professional Certificate on Coursera",
  "Full Stack Web Development course completed on Udemy",
  "NPTEL certification in Data Structures and Algorithms using Python",
  "Microsoft Certified: Azure Fundamentals (AZ-900)",
  "HackerRank certification in SQL (Intermediate)",
  "Machine Learning course by Andrew Ng on Coursera",
  "Cisco Certified Network Associate (CCNA) training",
  "NPTEL certification in Cloud Computing",
  "Oracle Certified Associate, Java SE 8 Programmer",
  "Great Learning certificate in Data Science Foundations",
  "Salesforce Certified Administrator",
  "IBM Data Science Professional Certificate",
  "TCS iON Career Edge Young Professional certification",
  "Microsoft Power BI Data Analyst Associate (PL-300)",
  "ISTQB Certified Tester Foundation Level",
];

const ACHIEVEMENTS = [
  "Secured {ordinal} position in the college level hackathon among {n} teams.",
  "Solved {n3}+ problems on LeetCode and GeeksforGeeks.",
  "Participated in Smart India Hackathon {year} and qualified for the internal round.",
  "Achieved a {stars} star rating on CodeChef.",
  "Won the best project award in the final year project exhibition.",
  "Qualified GATE {year} with a score of {n3}.",
  "Received the best employee of the quarter award for outstanding performance.",
  "Received the Star Performer award for successful delivery of the {domain} project.",
  "Secured a global rank of {n4} in Google Kickstart.",
  "Published a research paper in an international journal on {mltopic}.",
  "Got selected in the top {n} teams of Flipkart GRiD {year}.",
  "Recognised as a Postman Student Expert.",
];

const EXTRACURRICULAR = [
  "Active volunteer of the National Service Scheme (NSS) and participated in blood donation camps.",
  "Member of the organising committee for the annual technical fest of the college.",
  "Worked as a student coordinator for the training and placement cell.",
  "Core member of the Google Developer Student Club (GDSC) of my college.",
  "Participated in inter-college cricket tournaments and represented the college team.",
  "Conducted workshops on Git and GitHub for junior students.",
  "Class representative for two consecutive years.",
  "Volunteered to teach basic computer skills to school children under an NGO initiative.",
  "Member of the coding club and organised weekly contests for juniors.",
  "Participated in NCC and attained the B certificate.",
];

const STRENGTHS = [
  "Hard working and quick learner with a positive attitude.",
  "Good communication skills and ability to work in a team.",
  "Ability to adapt to new environments and learn new technologies quickly.",
  "Punctual, sincere and dedicated towards work.",
  "Strong problem solving and analytical thinking skills.",
];

const HOBBIES = ["Playing cricket", "Reading books", "Listening to music", "Travelling", "Playing chess", "Blogging", "Photography", "Badminton"];
const LANGUAGES = ["English, Hindi", "English, Hindi, Telugu", "English, Tamil", "English, Hindi, Marathi", "English, Kannada, Hindi", "English, Malayalam", "English, Bengali, Hindi", "English, Odia, Hindi", "English, Gujarati, Hindi"];

const DECLARATIONS = [
  "I hereby declare that the information furnished above is true to the best of my knowledge and belief.",
  "I hereby declare that all the details mentioned above are true and correct to the best of my knowledge.",
  "I hereby declare that the above information is correct to the best of my knowledge and I bear the responsibility for the correctness of the above mentioned particulars.",
  "I do hereby declare that the above particulars of facts and information stated are true, correct and complete to the best of my belief and knowledge.",
];

const SOFT_SKILLS = ["Communication", "Teamwork", "Problem Solving", "Time Management", "Leadership", "Adaptability", "Critical Thinking"];
const COMMON_TOOLS = ["Git", "GitHub", "VS Code", "JIRA", "Postman", "IntelliJ IDEA", "Eclipse", "Jupyter Notebook", "MS Office"];

// ═════════════════════════════════════════════════════════════════════════════
// Randomness
// ═════════════════════════════════════════════════════════════════════════════

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20260915;
const rand = mulberry32(SEED);

const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const chance = (p: number) => rand() < p;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;

/** Zipf-like pick: index i has weight 1/(i+1)^s, so earlier entries dominate. */
function zipf<T>(arr: readonly T[], s = 1.05): T {
  let total = 0;
  for (let i = 0; i < arr.length; i++) total += 1 / Math.pow(i + 1, s);
  let r = rand() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= 1 / Math.pow(i + 1, s);
    if (r <= 0) return arr[i]!;
  }
  return arr[arr.length - 1]!;
}

/** Draw `k` distinct items using the Zipf weighting. */
function zipfMany<T>(arr: readonly T[], k: number, s = 1.05): T[] {
  const out = new Set<T>();
  let guard = 0;
  while (out.size < Math.min(k, arr.length) && guard++ < 200) out.add(zipf(arr, s));
  return [...out];
}

function weighted<T>(entries: readonly [T, number][]): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [value, w] of entries) {
    r -= w;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1]![0];
}

// ═════════════════════════════════════════════════════════════════════════════
// Composition
// ═════════════════════════════════════════════════════════════════════════════

type Profile = {
  name: string;
  city: string;
  track: Track;
  role: string;
  fresher: boolean;
  years: number;
  gradYear: number;
  degree: string;
  college: string;
  company: string;
};

const ORDINALS = ["1st", "2nd", "3rd"];

function fill(template: string, p: Profile): string {
  const techs = TECH[p.track];
  const tech = zipf(techs, 0.9);
  let tech2 = zipf(techs, 0.9);
  if (tech2 === tech) tech2 = pick(techs);
  return template
    .replace(/\{tech\}/g, tech)
    .replace(/\{tech2\}/g, tech2)
    .replace(/\{domain\}/g, () => zipf(DOMAINS))
    .replace(/\{role\}/g, p.role)
    .replace(/\{company\}/g, p.company)
    .replace(/\{years\}/g, String(p.years))
    .replace(/\{degreeShort\}/g, p.degree.split(" ")[0]!.replace(/\(.*\)/, ""))
    .replace(/\{host\}/g, () => zipf(HOSTS))
    .replace(/\{target\}/g, () => pick(ML_TARGETS))
    .replace(/\{mltopic\}/g, () => pick(["deep learning", "image classification", "IoT security", "sentiment analysis"]))
    .replace(/\{ordinal\}/g, () => pick(ORDINALS))
    .replace(/\{year\}/g, () => String(p.gradYear - int(0, 2)))
    .replace(/\{pct\}/g, () => String(pick([15, 20, 25, 30, 35, 40, 50, 60])))
    .replace(/\{acc\}/g, () => String(int(82, 97)))
    .replace(/\{n\}/g, () => String(pick([3, 5, 10, 15, 20, 25, 50, 100])))
    .replace(/\{stars\}/g, () => String(int(3, 5)))
    .replace(/\{n2\}/g, () => String(int(3, 60)))
    .replace(/\{n3\}/g, () => String(int(80, 600)))
    .replace(/\{n4\}/g, () => String(int(900, 9000)));
}

function makeProfile(): Profile {
  const fresher = chance(0.65);
  const track = weighted(TRACK_WEIGHTS);
  const years = fresher ? 0 : weighted<number>([[1, 3], [2, 4], [3, 4], [4, 3], [5, 2], [6, 1], [8, 1]]);
  const gradYear = fresher ? int(2023, 2026) : 2025 - years - int(0, 1);
  let degree = zipf(DEGREES, 0.8);
  // Data and support roles pull in more non-CS graduates.
  if ((track === "support" || track === "data") && chance(0.3)) degree = pick(DEGREES.slice(3));
  return {
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    city: pick(CITIES),
    track,
    role: pick(TRACK_ROLES[track]),
    fresher,
    years,
    gradYear,
    degree,
    college: pick(COLLEGES),
    company: chance(0.75) ? zipf(SERVICE_COMPANIES, 0.9) : pick(SMALL_COMPANIES),
  };
}

function header(p: Profile): string[] {
  const handle = p.name.toLowerCase().replace(" ", ".") + int(1, 99);
  const phone = `+91 ${int(70000, 99999)} ${int(10000, 99999)}`;
  const contact = chance(0.5)
    ? `${handle}@gmail.com | ${phone} | linkedin.com/in/${handle.replace(".", "-")}`
    : `Email: ${handle}@gmail.com  Mobile: ${phone}  ${p.city}`;
  const lines = [chance(0.4) ? p.name.toUpperCase() : p.name, contact];
  if (chance(0.35)) lines.push(`GitHub: github.com/${handle.replace(".", "")}`);
  return lines;
}

function objective(p: Profile): string[] {
  if (p.fresher) {
    return [chance(0.5) ? "CAREER OBJECTIVE" : "OBJECTIVE", ...zipfMany(OBJECTIVES, chance(0.3) ? 2 : 1, 1.2).map((t) => fill(t, p))];
  }
  const count = int(3, 5);
  return [chance(0.6) ? "PROFESSIONAL SUMMARY" : "SUMMARY", ...zipfMany(SUMMARIES, count, 0.9).map((t) => `• ${fill(t, p)}`)];
}

function education(p: Profile): string[] {
  const cgpa = (int(62, 94) / 10).toFixed(2);
  const lines = ["EDUCATION"];
  const start = p.degree.includes("Master") || p.degree.includes("M.Tech") ? p.gradYear - 2 : p.gradYear - 4;
  if (chance(0.5)) {
    lines.push(`${p.degree} | ${p.college} | ${start} – ${p.gradYear}`, `CGPA: ${cgpa}/10`);
  } else {
    lines.push(`${p.degree} from ${p.college} with CGPA of ${cgpa} (${start} – ${p.gradYear})`);
  }
  if (p.fresher || chance(0.4)) {
    const xii = int(62, 96);
    const x = int(65, 98);
    const board = pick(BOARDS);
    if (chance(0.5)) {
      lines.push(`Class XII (${board}) from ${pick(["Sri Chaitanya Junior College", "Kendriya Vidyalaya", "Delhi Public School", "Narayana Junior College", "Government Senior Secondary School", "St. Joseph's Higher Secondary School"])} with ${xii}% in ${start - 1}`);
      lines.push(`Class X (${board}) with ${x}% in ${start - 3}`);
    } else {
      lines.push(`Intermediate / 12th | ${board} | ${xii}%`, `SSC / 10th | ${board} | ${x}%`);
    }
  }
  return lines;
}

function bulletPool(p: Profile): string[] {
  // Generic clichés are listed first so they win the Zipf draw across tracks.
  return [...GENERIC_BULLETS.slice(0, 6), ...TRACK_BULLETS[p.track], ...GENERIC_BULLETS.slice(6)];
}

function internSpan(year: number): string {
  const [from, to] = pick([["Jan", "Mar"], ["May", "July"], ["June", "Aug"], ["Dec", "Feb"]] as const);
  return `${from} ${year} – ${to} ${from === "Dec" ? year + 1 : year}`;
}

/** Bullets already used in the current resume — nobody repeats a bullet verbatim. */
let usedBullets = new Set<string>();

function freshBullets(pool: readonly string[], k: number, s = 1.05): string[] {
  const out: string[] = [];
  let guard = 0;
  while (out.length < k && guard++ < 200) {
    const t = zipf(pool, s);
    if (usedBullets.has(t)) continue;
    usedBullets.add(t);
    out.push(t);
  }
  return out;
}

function experience(p: Profile): string[] {
  const pool = bulletPool(p);
  if (p.fresher) {
    if (!chance(0.7)) return [];
    const place = pick(INTERN_PLACES);
    const lines = [chance(0.5) ? "INTERNSHIPS" : "INTERNSHIP EXPERIENCE", `${pick(TRACK_ROLES[p.track])} Intern | ${place} | ${internSpan(p.gradYear - 1)}`];
    for (const t of freshBullets(pool, int(2, 4))) lines.push(`• ${fill(t, p)}`);
    return lines;
  }
  const lines = [chance(0.6) ? "WORK EXPERIENCE" : "PROFESSIONAL EXPERIENCE"];
  const jobs = p.years >= 4 ? int(2, 3) : p.years >= 2 ? int(1, 2) : 1;
  let endYear = 2026;
  for (let j = 0; j < jobs; j++) {
    const company = j === 0 ? p.company : chance(0.6) ? pick(SERVICE_COMPANIES) : pick(SMALL_COMPANIES);
    const span = Math.max(1, Math.round(p.years / jobs));
    const startYear = endYear - span;
    lines.push(`${j === 0 ? p.role : pick(TRACK_ROLES[p.track])} | ${company} | ${pick(["Jan", "Mar", "Jun", "Aug", "Oct"])} ${startYear} – ${j === 0 ? "Present" : `${pick(["Feb", "May", "Jul", "Dec"])} ${endYear}`}`);
    if (chance(0.4)) lines.push(`Client: ${pick(["a leading US bank", "a UK based insurance company", "a global retail brand", "an Australian telecom provider", "a Fortune 500 healthcare company"])}`);
    for (const t of freshBullets(pool, j === 0 ? int(4, 6) : int(2, 4))) lines.push(`• ${fill(t, p)}`);
    endYear = startYear;
  }
  return lines;
}

function projects(p: Profile): string[] {
  const count = p.fresher ? int(2, 3) : int(0, 2);
  if (count === 0) return [];
  const lines = [chance(0.6) ? "PROJECTS" : chance(0.5) ? "ACADEMIC PROJECTS" : "KEY PROJECTS"];
  const pool = TRACK_BULLETS[p.track];
  for (const title of zipfMany(PROJECT_TITLES[p.track], count, 0.9)) {
    lines.push(chance(0.5) ? title : `${title} | ${zipfMany(TECH[p.track], 2, 0.8).join(", ")}`);
    const noun = title.toLowerCase().replace(/\(.*\)/, "").trim();
    if (chance(0.35)) lines.push(`• ${pick(["Developed", "Built", "Created", "Designed"])} ${/^[aeiou]/.test(noun) ? "an" : "a"} ${noun} ${pick(["to help users", "that allows users", "which enables users"])} to ${pick(["manage their data easily", "save time", "track records in one place", "access information quickly"])}.`);
    for (const t of freshBullets(pool, int(2, 3), 0.95)) lines.push(`• ${fill(t, p)}`);
  }
  return lines;
}

function skills(p: Profile): string[] {
  const label = pick(["TECHNICAL SKILLS", "SKILLS", "KEY SKILLS", "TECHNICAL SKILLS & TOOLS"]);
  const tech = zipfMany(TECH[p.track], int(5, 8), 0.7);
  const lines = [label];
  if (chance(0.6)) {
    lines.push(`Languages: ${pick(["C, C++, Java, Python", "Java, Python, SQL", "Python, SQL", "JavaScript, TypeScript", "C, Java, JavaScript", "Kotlin, Java"])}`);
    lines.push(`Technologies: ${tech.join(", ")}`);
    lines.push(`Tools: ${zipfMany(COMMON_TOOLS, int(3, 5)).join(", ")}`);
  } else {
    lines.push(tech.concat(zipfMany(COMMON_TOOLS, 3)).join(", "));
  }
  if (chance(0.5)) lines.push(`Soft Skills: ${zipfMany(SOFT_SKILLS, 4).join(", ")}`);
  if (chance(0.35)) lines.push(`• Having good knowledge of ${pick(TECH[p.track])} and ${pick(["OOPS concepts", "DBMS", "data structures and algorithms", "operating systems", "computer networks"])}.`);
  return lines;
}

function certifications(p: Profile): string[] {
  if (!chance(p.fresher ? 0.8 : 0.5)) return [];
  return [pick(["CERTIFICATIONS", "CERTIFICATES", "COURSES & CERTIFICATIONS"]), ...zipfMany(CERTIFICATIONS, int(2, 4), 0.8).map((c) => `• ${c}`)];
}

function achievements(p: Profile): string[] {
  if (!chance(0.6)) return [];
  return [pick(["ACHIEVEMENTS", "ACHIEVEMENTS & AWARDS", "AWARDS"]), ...zipfMany(ACHIEVEMENTS, int(1, 3), 0.9).map((a) => `• ${fill(a, p)}`)];
}

function extracurricular(p: Profile): string[] {
  if (!p.fresher || !chance(0.55)) return [];
  return [pick(["EXTRA-CURRICULAR ACTIVITIES", "EXTRACURRICULAR ACTIVITIES", "POSITIONS OF RESPONSIBILITY"]), ...zipfMany(EXTRACURRICULAR, int(1, 3), 0.9).map((a) => `• ${a}`)];
}

function strengths(p: Profile): string[] {
  if (!chance(p.fresher ? 0.45 : 0.15)) return [];
  return [pick(["STRENGTHS", "PERSONAL STRENGTHS"]), ...zipfMany(STRENGTHS, int(2, 3), 0.9).map((s) => `• ${s}`)];
}

function personalDetails(p: Profile): string[] {
  if (!chance(p.fresher ? 0.6 : 0.3)) return [];
  const lines = ["PERSONAL DETAILS"];
  lines.push(`Date of Birth: ${String(int(1, 28)).padStart(2, "0")}/${String(int(1, 12)).padStart(2, "0")}/${p.gradYear - 22 + int(-1, 1)}`);
  if (chance(0.6)) lines.push(`Father's Name: ${pick(["Mr.", "Shri"])} ${pick(FIRST_NAMES.filter((_, i) => i % 2 === 0))} ${p.name.split(" ")[1]}`);
  lines.push(`Gender: ${pick(["Male", "Female"])}`);
  if (chance(0.7)) lines.push(`Marital Status: ${p.fresher ? "Single" : pick(["Single", "Married"])}`);
  lines.push(`Languages Known: ${pick(LANGUAGES)}`);
  if (chance(0.5)) lines.push(`Hobbies: ${zipfMany(HOBBIES, 3).join(", ")}`);
  if (chance(0.4)) lines.push(`Address: ${pick(["Flat No.", "H.No.", "Plot No."])} ${int(1, 400)}, ${pick(["Gandhi Nagar", "Shivaji Nagar", "Anna Nagar", "Sector 12", "Indira Colony", "MG Road"])}, ${p.city}`);
  return lines;
}

function declaration(p: Profile): string[] {
  if (!chance(p.fresher ? 0.6 : 0.35)) return [];
  const lines = ["DECLARATION", zipf(DECLARATIONS, 1.3)];
  if (chance(0.7)) lines.push(`Place: ${p.city}`, "Date:", p.name);
  return lines;
}

function composeResume(): string {
  const p = makeProfile();
  usedBullets = new Set();
  const top = objective(p);
  const middle: string[][] = p.fresher
    ? [education(p), projects(p), experience(p), skills(p), certifications(p)]
    : [experience(p), skills(p), projects(p), education(p), certifications(p)];

  // Real resumes don't agree on order: swap a neighbouring pair now and then.
  if (chance(0.35)) {
    const i = int(0, middle.length - 2);
    [middle[i], middle[i + 1]] = [middle[i + 1]!, middle[i]!];
  }
  // Some people lead with skills.
  if (chance(0.15)) {
    const idx = middle.findIndex((s) => s[0]?.includes("SKILLS"));
    if (idx > 0) middle.unshift(...middle.splice(idx, 1));
  }

  const sections = [
    header(p),
    chance(0.9) ? top : [],
    ...middle,
    achievements(p),
    extracurricular(p),
    strengths(p),
    personalDetails(p),
    declaration(p),
  ].filter((s) => s.length > 0);

  return sections.map((s) => s.join("\n")).join("\n\n") + "\n";
}

// ═════════════════════════════════════════════════════════════════════════════
// CLI
// ═════════════════════════════════════════════════════════════════════════════

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

function main() {
  const count = Number.parseInt(arg("count", "46547"), 10);
  if (!Number.isFinite(count) || count < 1) throw new Error("--count must be a positive integer");
  const outDir = resolve(arg("out", "./corpus"));
  mkdirSync(outDir, { recursive: true });

  const width = Math.max(4, String(count).length);
  for (let i = 1; i <= count; i++) {
    writeFileSync(join(outDir, `ref-${String(i).padStart(width, "0")}.txt`), composeResume(), "utf8");
  }
  console.log(`Wrote ${count} generated reference resumes to ${outDir} (seed ${SEED}).`);
}

main();
