import { writeBatch, doc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage, getCurrentUser } from '../config/firebase';
import { Memory } from '../types/memory';

const DEMO_MEMORIES: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      date: '2020-07-15',
      rawText: 'Today was my first day of engineering college at Anna University. I still remember walking into the campus with nervous excitement. I didn’t know anyone, but I knew this was the beginning of something big. Called Appa that evening and told him I would make him proud.',
      emotion: 'Hope',
      people: ['Appa'],
      location: 'Anna University, Tamil Nadu',
      lifeStage: 'Undergraduate',
      themes: ['Education', 'New Beginnings', 'Family'],
      summary: 'First day of engineering college, filled with nervous hope and promise to family.'
    },
    {
      date: '2021-03-02',
      rawText: 'Pulled my first all-nighter debugging a stubborn segmentation fault in C++. I was exhausted but when the program finally ran without crashing, I literally shouted in my room. That feeling of solving something impossible was addictive.',
      emotion: 'Pride',
      people: [],
      location: 'Hostel Room',
      lifeStage: 'Undergraduate',
      themes: ['Growth', 'Problem Solving', 'Persistence'],
      summary: 'Stayed up all night debugging and felt immense pride when it finally worked.'
    },
    {
      date: '2022-08-18',
      rawText: 'Submitted my GRE application today. The entire process felt overwhelming — exams, SOP drafts, LOR requests. Amma kept saying, “You can do this.” I’m scared but also dreaming about studying in the US.',
      emotion: 'Anxiety',
      people: ['Amma'],
      location: 'Home, Tamil Nadu',
      lifeStage: 'Undergraduate',
      themes: ['Ambition', 'Family Support', 'Uncertainty'],
      summary: 'Applied for US Master’s programs, feeling anxious but supported by family.'
    },
    {
      date: '2024-08-28',
      rawText: 'First week at Santa Clara University. Everything feels different — the classrooms, the culture, the independence. I walked around campus alone today and thought about how far I’ve come from home.',
      emotion: 'Gratitude',
      people: [],
      location: 'Santa Clara University',
      lifeStage: 'Graduate Student',
      themes: ['Migration', 'Growth', 'Independence'],
      summary: 'First week in the US for Master’s, reflecting on the journey from home.'
    },
    {
      date: '2024-09-12',
      rawText: 'Today I spoke in Toastmasters for the first time in the US. My voice was shaking, but I pushed through. After the meeting, someone said they felt inspired by my story. That meant more than I expected.',
      emotion: 'Courage',
      people: ['Toastmasters Members'],
      location: 'Santa Clara',
      lifeStage: 'Graduate Student',
      themes: ['Leadership', 'Public Speaking', 'Self Growth'],
      summary: 'Delivered first Toastmasters speech in the US and felt proud overcoming fear.'
    },
    {
      date: '2025-02-14',
      rawText: 'Worked late in the lab finishing my AI assignment. It was Valentine’s Day and most people were out. I felt slightly lonely but also focused. I reminded myself that building this future matters.',
      emotion: 'Loneliness',
      people: [],
      location: 'University Lab',
      lifeStage: 'Graduate Student',
      themes: ['Sacrifice', 'Discipline', 'Ambition'],
      summary: 'Spent Valentine’s Day studying, balancing loneliness with ambition.'
    },
    {
      date: '2025-03-22',
      rawText: 'Got the email — SanDisk internship offer. I reread it three times to believe it. I immediately video called my parents. Amma cried. I felt like every late night was worth it.',
      emotion: 'Joy',
      people: ['Amma', 'Appa'],
      location: 'Apartment, California',
      lifeStage: 'Graduate Student',
      themes: ['Achievement', 'Family', 'Career'],
      summary: 'Received SanDisk internship offer and celebrated emotionally with family.'
    },
    {
      date: '2025-06-03',
      rawText: 'First day at SanDisk as an intern. Walking into the office felt surreal. Imposter syndrome kicked in, but I reminded myself I earned this.',
      emotion: 'Nervous',
      people: ['Team Members'],
      location: 'SanDisk, California',
      lifeStage: 'Young Adult',
      themes: ['Career', 'Self Doubt', 'Growth'],
      summary: 'Started internship at SanDisk, battling imposter syndrome.'
    },
    {
      date: '2025-07-18',
      rawText: 'Presented my RAG chatbot system to senior engineers today. They asked tough questions, but I answered confidently. Walking back to my desk, I felt stronger than ever.',
      emotion: 'Confidence',
      people: ['Engineering Team'],
      location: 'SanDisk Office',
      lifeStage: 'Young Adult',
      themes: ['Technical Growth', 'Leadership', 'Achievement'],
      summary: 'Successfully presented AI system to senior engineers.'
    },
    {
      date: '2025-08-29',
      rawText: 'Gym progress check today. I’ve lost weight and feel stronger. It’s not just physical — I feel mentally sharper too. Discipline in one area is spilling into others.',
      emotion: 'Motivation',
      people: [],
      location: 'Gym',
      lifeStage: 'Young Adult',
      themes: ['Health', 'Discipline', 'Self Improvement'],
      summary: 'Noticed fitness transformation boosting confidence and discipline.'
    },
    {
      date: '2025-09-11',
      rawText: 'Late-night call with family back home. Hearing familiar voices made me realize how much I miss them. Living abroad teaches independence but also distance.',
      emotion: 'Nostalgia',
      people: ['Family'],
      location: 'California Apartment',
      lifeStage: 'Young Adult',
      themes: ['Family', 'Migration', 'Emotion'],
      summary: 'Felt nostalgic during late-night call with family in India.'
    },
    {
      date: '2025-10-04',
      rawText: 'Participated in a hackathon this weekend. Built something meaningful in 24 hours. The adrenaline, teamwork, and chaos reminded me why I love building.',
      emotion: 'Excitement',
      people: ['Hackathon Team'],
      location: 'University Campus',
      lifeStage: 'Graduate Student',
      themes: ['Innovation', 'Teamwork', 'Impact'],
      summary: 'Built a project in 24-hour hackathon and felt energized.'
    },
    {
      date: '2025-11-20',
      rawText: 'Had a tough code review today. My implementation was criticized heavily. It stung, but I realized this is how I grow. Improvement isn’t always comfortable.',
      emotion: 'Frustration',
      people: ['Mentor'],
      location: 'Office',
      lifeStage: 'Young Adult',
      themes: ['Growth', 'Resilience', 'Learning'],
      summary: 'Received tough feedback during code review and chose growth.'
    },
    {
      date: '2026-01-01',
      rawText: 'New Year’s Day. Sat alone reflecting on the past year — new country, internship, growth. I wrote down goals: build something impactful, stay consistent, help family.',
      emotion: 'Reflection',
      people: [],
      location: 'Apartment',
      lifeStage: 'Young Adult',
      themes: ['Reflection', 'Ambition', 'Purpose'],
      summary: 'Reflected on past year and set ambitious personal goals.'
    },
    {
      date: '2026-02-10',
      rawText: 'Helped a student understand networking concepts as a TA. Seeing their face light up when they finally understood subnetting made my day.',
      emotion: 'Fulfillment',
      people: ['Student'],
      location: 'University Lab',
      lifeStage: 'Graduate Student',
      themes: ['Teaching', 'Impact', 'Leadership'],
      summary: 'Felt fulfilled helping a student grasp difficult networking topic.'
    },
    {
      date: '2024-05-15',
      rawText: 'Graduation day from Anna University. Held the degree in my hand and remembered every struggle — exams, projects, late nights. Hugged my parents tightly.',
      emotion: 'Pride',
      people: ['Parents'],
      location: 'Tamil Nadu',
      lifeStage: 'Undergraduate',
      themes: ['Achievement', 'Family', 'Milestone'],
      summary: 'Graduated engineering with parents proudly beside me.'
    },
    {
      date: '2023-12-02',
      rawText: 'Built my first Flutter app and deployed it. Seeing it live felt unreal. Something I coded was being used by real people.',
      emotion: 'Excitement',
      people: [],
      location: 'Home',
      lifeStage: 'Undergraduate',
      themes: ['Creation', 'Technology', 'Achievement'],
      summary: 'Launched first real-world app and felt excited.'
    },
    {
      date: '2022-11-09',
      rawText: 'Faced rejection from a company I really wanted. I felt defeated for a day. Then I opened my laptop again and started preparing harder.',
      emotion: 'Disappointment',
      people: [],
      location: 'Hostel',
      lifeStage: 'Undergraduate',
      themes: ['Resilience', 'Career', 'Growth'],
      summary: 'Handled job rejection and recommitted to improvement.'
    },
    {
      date: '2025-04-18',
      rawText: 'Finished implementing the FAISS vector search pipeline for the chatbot project. Watching the retrieval accuracy improve felt like unlocking a new level.',
      emotion: 'Achievement',
      people: ['Team'],
      location: 'SanDisk Office',
      lifeStage: 'Young Adult',
      themes: ['AI', 'Innovation', 'Technical Growth'],
      summary: 'Improved chatbot retrieval accuracy using vector search.'
    },
    {
      date: '2026-02-28',
      rawText: 'Today we pitched EverAfter at Hack for Humanity. I felt nervous before stepping up, but once I started speaking, it felt natural. I realized I’ve grown not just technically, but as a storyteller.',
      emotion: 'Pride',
      people: ['Team'],
      location: 'Santa Clara University',
      lifeStage: 'Young Adult',
      themes: ['Innovation', 'Leadership', 'Public Speaking'],
      summary: 'Presented EverAfter at hackathon and felt confident growth.'
    },
      {
        date: '2024-09-25',
        rawText: 'Cooked my first proper meal in the US today — sambar and rice. It wasn’t perfect, but the smell reminded me of home. I stood alone in the kitchen smiling like an idiot.',
        emotion: 'Nostalgia',
        people: [],
        location: 'Apartment, California',
        lifeStage: 'Graduate Student',
        themes: ['Independence', 'Home', 'Migration'],
        summary: 'Cooked Indian food alone abroad and felt a wave of nostalgia.'
      },
      {
        date: '2024-10-03',
        rawText: 'Struggled to understand an Advanced Operating Systems lecture today. Everyone else seemed to get it faster. I stayed back after class and asked questions. I refuse to fall behind.',
        emotion: 'Determination',
        people: ['Professor'],
        location: 'Santa Clara University',
        lifeStage: 'Graduate Student',
        themes: ['Perseverance', 'Education', 'Self Growth'],
        summary: 'Felt academically challenged but chose persistence.'
      },
      {
        date: '2024-10-19',
        rawText: 'Had my first real networking event in Silicon Valley. I felt awkward introducing myself, but by the end of the evening, I had real conversations. Stepping outside comfort zones works.',
        emotion: 'Growth',
        people: ['Industry Professionals'],
        location: 'Silicon Valley',
        lifeStage: 'Graduate Student',
        themes: ['Networking', 'Confidence', 'Career'],
        summary: 'Attended networking event and gained confidence socially.'
      },
      {
        date: '2024-11-05',
        rawText: 'Checked my bank balance today and felt stressed. Living abroad is expensive. I reminded myself this is an investment in my future.',
        emotion: 'Stress',
        people: [],
        location: 'Apartment',
        lifeStage: 'Graduate Student',
        themes: ['Financial Responsibility', 'Independence', 'Reality'],
        summary: 'Felt financial pressure but reframed it as long-term investment.'
      },
      {
        date: '2024-11-18',
        rawText: 'Ran 3 kilometers without stopping for the first time in months. I felt my lungs burning but my mind was calm. Fitness feels like therapy.',
        emotion: 'Relief',
        people: [],
        location: 'Neighborhood Park',
        lifeStage: 'Young Adult',
        themes: ['Health', 'Discipline', 'Mental Strength'],
        summary: 'Completed a challenging run and felt mentally lighter.'
      },
      {
        date: '2024-12-24',
        rawText: 'First Christmas in the US. I walked through decorated streets and felt both excited and slightly lonely. Called home and wished everyone. Distance feels heavier during festivals.',
        emotion: 'Bittersweet',
        people: ['Family'],
        location: 'California',
        lifeStage: 'Graduate Student',
        themes: ['Migration', 'Culture', 'Family'],
        summary: 'Experienced first Christmas abroad with mixed emotions.'
      },
      {
        date: '2025-01-15',
        rawText: 'Started drafting a startup idea today. Not sure if it will work, but something inside me wants to build something impactful beyond just a job.',
        emotion: 'Ambition',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Entrepreneurship', 'Dreams', 'Innovation'],
        summary: 'Began thinking seriously about building a startup.'
      },
      {
        date: '2025-02-01',
        rawText: 'Helped a friend debug their project for hours. When it finally worked, we high-fived like kids. Collaboration feels better than solo wins.',
        emotion: 'Joy',
        people: ['Friend'],
        location: 'University Lab',
        lifeStage: 'Graduate Student',
        themes: ['Friendship', 'Teamwork', 'Support'],
        summary: 'Shared a collaborative success fixing a project bug.'
      },
      {
        date: '2025-03-10',
        rawText: 'Had a moment of doubt today — wondering if I’m good enough for this industry. Then I looked at everything I’ve built so far and reminded myself I’ve earned my place.',
        emotion: 'Self Doubt',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Confidence', 'Growth', 'Reflection'],
        summary: 'Faced imposter syndrome but reaffirmed self-worth.'
      },
      {
        date: '2025-04-02',
        rawText: 'Presented a machine learning project in class. My explanation flowed smoothly. A year ago I would have stumbled. Growth is subtle but powerful.',
        emotion: 'Confidence',
        people: ['Classmates'],
        location: 'Santa Clara University',
        lifeStage: 'Graduate Student',
        themes: ['Public Speaking', 'Education', 'Growth'],
        summary: 'Delivered confident ML presentation and recognized personal growth.'
      },
      {
        date: '2025-05-05',
        rawText: 'Spent the entire Sunday refining my resume again. It’s exhausting constantly optimizing yourself, but I know opportunity rewards preparation.',
        emotion: 'Focused',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Career', 'Preparation', 'Ambition'],
        summary: 'Dedicated time to improving resume despite fatigue.'
      },
      {
        date: '2025-06-25',
        rawText: 'Received positive feedback from my manager at internship. He said I think like a systems engineer. That sentence stayed with me all day.',
        emotion: 'Pride',
        people: ['Manager'],
        location: 'SanDisk',
        lifeStage: 'Young Adult',
        themes: ['Career', 'Validation', 'Growth'],
        summary: 'Manager praised systems thinking, boosting confidence.'
      },
      {
        date: '2025-07-04',
        rawText: 'Watched fireworks on Independence Day. Thought about independence in my own life — financially, emotionally, geographically.',
        emotion: 'Reflection',
        people: [],
        location: 'California',
        lifeStage: 'Young Adult',
        themes: ['Independence', 'Migration', 'Identity'],
        summary: 'Reflected on personal independence during July 4th fireworks.'
      },
      {
        date: '2025-08-02',
        rawText: 'Missed a deadline today. It bothered me more than I expected. I don’t like letting myself down. Tomorrow I’ll do better.',
        emotion: 'Frustration',
        people: [],
        location: 'Office',
        lifeStage: 'Young Adult',
        themes: ['Responsibility', 'Self Discipline', 'Growth'],
        summary: 'Missed deadline and committed to improving discipline.'
      },
      {
        date: '2025-09-14',
        rawText: 'Facilitated a Toastmasters workshop. Watching others overcome fear reminded me of my own early nervous speeches.',
        emotion: 'Fulfillment',
        people: ['Toastmasters Members'],
        location: 'Santa Clara',
        lifeStage: 'Young Adult',
        themes: ['Leadership', 'Mentorship', 'Community'],
        summary: 'Led workshop and felt fulfilled helping others grow.'
      },
      {
        date: '2025-10-20',
        rawText: 'Stayed up building a feature nobody asked for — just because I wanted to see if I could. That curiosity is my real fuel.',
        emotion: 'Curiosity',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Innovation', 'Creativity', 'Passion'],
        summary: 'Built extra feature purely driven by curiosity.'
      },
      {
        date: '2025-11-02',
        rawText: 'Had a long walk alone thinking about my future. Career, family, impact — it all feels big. I don’t have all answers, but I have direction.',
        emotion: 'Contemplative',
        people: [],
        location: 'Park',
        lifeStage: 'Young Adult',
        themes: ['Future', 'Purpose', 'Growth'],
        summary: 'Reflected deeply on long-term life direction.'
      },
      {
        date: '2025-12-31',
        rawText: 'End of another year. Reviewed my journal entries. The version of me from last year would be proud of who I am becoming.',
        emotion: 'Gratitude',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Reflection', 'Growth', 'Self Awareness'],
        summary: 'Reflected on year and felt grateful for personal growth.'
      },
      {
        date: '2026-01-12',
        rawText: 'Helped a junior student prepare for interviews. I saw myself in them — confused but ambitious. Feels good to give back.',
        emotion: 'Empathy',
        people: ['Junior Student'],
        location: 'University',
        lifeStage: 'Young Adult',
        themes: ['Mentorship', 'Impact', 'Community'],
        summary: 'Mentored junior student and felt empathetic connection.'
      },
      {
        date: '2026-02-05',
        rawText: 'Worked out even though I didn’t feel like it. Discipline isn’t about motivation — it’s about showing up.',
        emotion: 'Determination',
        people: [],
        location: 'Gym',
        lifeStage: 'Young Adult',
        themes: ['Health', 'Discipline', 'Consistency'],
        summary: 'Chose discipline over mood and felt stronger.'
      },
      {
        date: '2026-02-14',
        rawText: 'Saw couples celebrating Valentine’s Day again. I felt okay this time. I’ve learned to enjoy my own company.',
        emotion: 'Acceptance',
        people: [],
        location: 'California',
        lifeStage: 'Young Adult',
        themes: ['Self Love', 'Growth', 'Independence'],
        summary: 'Felt peaceful spending Valentine’s Day alone.'
      },
      {
        date: '2026-03-03',
        rawText: 'Tried explaining vector databases to a non-technical friend. Simplifying complex ideas is harder than building them.',
        emotion: 'Challenge',
        people: ['Friend'],
        location: 'Cafe',
        lifeStage: 'Young Adult',
        themes: ['Communication', 'Learning', 'Perspective'],
        summary: 'Realized explaining tech simply is its own skill.'
      },
      {
        date: '2026-03-15',
        rawText: 'Felt exhausted today. Burnout is real. Took a break and watched something light. Rest is not weakness.',
        emotion: 'Fatigue',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Balance', 'Mental Health', 'Self Care'],
        summary: 'Recognized burnout and chose rest.'
      },
      {
        date: '2026-04-01',
        rawText: 'Submitted a research proposal. Even if it doesn’t get accepted, I’m proud I tried.',
        emotion: 'Hope',
        people: [],
        location: 'University',
        lifeStage: 'Graduate Student',
        themes: ['Research', 'Courage', 'Growth'],
        summary: 'Submitted research proposal with hopeful anticipation.'
      },
      {
        date: '2026-04-20',
        rawText: 'Revisited my first code repository from college. The code was messy — but it reminded me how far I’ve come.',
        emotion: 'Pride',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Growth', 'Reflection', 'Learning'],
        summary: 'Looked back at early code and saw clear improvement.'
      },
      {
        date: '2026-05-09',
        rawText: 'Faced a production bug that affected users. Fixed it after hours of digging. Real-world responsibility feels heavy but meaningful.',
        emotion: 'Responsibility',
        people: ['Users'],
        location: 'Office',
        lifeStage: 'Young Adult',
        themes: ['Accountability', 'Career', 'Problem Solving'],
        summary: 'Handled real-world production issue and felt accountable.'
      },
      {
        date: '2026-05-21',
        rawText: 'Went hiking with friends. No laptops, no deadlines — just conversations and fresh air. I need more days like this.',
        emotion: 'Peace',
        people: ['Friends'],
        location: 'Mountain Trail',
        lifeStage: 'Young Adult',
        themes: ['Friendship', 'Balance', 'Nature'],
        summary: 'Enjoyed peaceful hike with friends away from work.'
      },
      {
        date: '2026-06-01',
        rawText: 'Started planning for long-term career moves. The idea of leading teams one day excites me.',
        emotion: 'Ambition',
        people: [],
        location: 'Apartment',
        lifeStage: 'Young Adult',
        themes: ['Leadership', 'Career', 'Vision'],
        summary: 'Began envisioning future leadership roles.'
      },
      {
        date: '2026-06-15',
        rawText: 'Called my grandparents today. Their voices sounded older. Time moves faster than I expect.',
        emotion: 'Tenderness',
        people: ['Grandparents'],
        location: 'California',
        lifeStage: 'Young Adult',
        themes: ['Family', 'Aging', 'Gratitude'],
        summary: 'Felt emotional noticing grandparents aging.'
      },
      {
        date: '2026-07-01',
        rawText: 'Received appreciation from a professor for helping improve a project. It felt validating beyond grades.',
        emotion: 'Validation',
        people: ['Professor'],
        location: 'Santa Clara University',
        lifeStage: 'Graduate Student',
        themes: ['Recognition', 'Growth', 'Education'],
        summary: 'Professor appreciated contribution beyond academics.'
      },
        {
          date: '2026-08-10',
          rawText: 'Graduation day at Santa Clara University. Holding my Master’s degree felt surreal. I thought about every sacrifice — financial stress, loneliness, sleepless nights. Called my parents immediately. Their pride felt heavier than the certificate.',
          emotion: 'Pride',
          people: ['Amma', 'Appa'],
          location: 'Santa Clara University',
          lifeStage: 'Young Adult',
          themes: ['Achievement', 'Family', 'Education'],
          summary: 'Graduated with Master’s degree and shared emotional moment with parents.'
        },
        {
          date: '2027-02-15',
          rawText: 'Started my first full-time engineering job today. The responsibility feels bigger now. No more student safety net — just real-world impact.',
          emotion: 'Determination',
          people: ['Team'],
          location: 'California',
          lifeStage: 'Young Adult',
          themes: ['Career', 'Independence', 'Growth'],
          summary: 'Began full-time engineering role with new sense of responsibility.'
        },
        {
          date: '2027-09-04',
          rawText: 'Moved into a slightly bigger apartment today. It’s not luxury, but it feels earned. Progress doesn’t always look dramatic — sometimes it’s just more space and peace.',
          emotion: 'Contentment',
          people: [],
          location: 'California',
          lifeStage: 'Young Adult',
          themes: ['Stability', 'Growth', 'Independence'],
          summary: 'Moved into better apartment, symbolizing quiet progress.'
        },
        {
          date: '2028-03-11',
          rawText: 'Faced my first major project failure at work. Months of effort scrapped due to strategy change. It hurt, but I learned that impact isn’t always in our control.',
          emotion: 'Disappointment',
          people: ['Team'],
          location: 'Office',
          lifeStage: 'Young Adult',
          themes: ['Resilience', 'Career', 'Learning'],
          summary: 'Handled large project cancellation and learned resilience.'
        },
        {
          date: '2028-10-22',
          rawText: 'Visited India after years. Hugging my parents at the airport felt different — deeper. I realized time with them is finite.',
          emotion: 'Gratitude',
          people: ['Parents'],
          location: 'Tamil Nadu',
          lifeStage: 'Young Adult',
          themes: ['Family', 'Migration', 'Love'],
          summary: 'Returned home and felt profound gratitude for family.'
        },
        {
          date: '2029-06-03',
          rawText: 'Took the leap and started building my own startup idea part-time. It’s risky, but something inside me wants to create more than just code.',
          emotion: 'Ambition',
          people: [],
          location: 'California',
          lifeStage: 'Adult',
          themes: ['Entrepreneurship', 'Risk', 'Innovation'],
          summary: 'Began startup journey while balancing job.'
        },
        {
          date: '2030-01-01',
          rawText: 'Turned 30 today. Reflected on the last decade — from a nervous college student to a working professional in another country. Growth isn’t loud, but it’s real.',
          emotion: 'Reflection',
          people: [],
          location: 'California',
          lifeStage: 'Adult',
          themes: ['Milestone', 'Growth', 'Identity'],
          summary: 'Turned 30 and reflected on decade of transformation.'
        },
        {
          date: '2031-04-18',
          rawText: 'Got engaged today. I never imagined balancing ambition and companionship could feel so natural. Life feels fuller.',
          emotion: 'Joy',
          people: ['Partner'],
          location: 'California',
          lifeStage: 'Adult',
          themes: ['Love', 'Commitment', 'Growth'],
          summary: 'Got engaged and felt emotional fulfillment.'
        },
        {
          date: '2032-02-14',
          rawText: 'Married the person who stood beside me through chaos and calm. I promised to build not just a career, but a life.',
          emotion: 'Love',
          people: ['Partner', 'Family'],
          location: 'India',
          lifeStage: 'Adult',
          themes: ['Marriage', 'Family', 'Commitment'],
          summary: 'Marriage day marked a new chapter of partnership.'
        },
        {
          date: '2033-09-01',
          rawText: 'Our first child was born today. Holding them felt overwhelming. Suddenly, my dreams felt secondary to their future.',
          emotion: 'Overwhelmed',
          people: ['Partner', 'Child'],
          location: 'California',
          lifeStage: 'Parenthood',
          themes: ['Family', 'Responsibility', 'Love'],
          summary: 'Became a parent and felt profound responsibility.'
        },
        {
          date: '2034-05-20',
          rawText: 'Sleep-deprived but strangely happy. Parenthood is exhausting but meaningful. My priorities are shifting quietly.',
          emotion: 'Fulfillment',
          people: ['Child'],
          location: 'Home',
          lifeStage: 'Parenthood',
          themes: ['Family', 'Sacrifice', 'Growth'],
          summary: 'Experienced the demanding but rewarding reality of parenthood.'
        },
        {
          date: '2035-11-12',
          rawText: 'My startup failed today. Investors pulled out. I felt embarrassed and disappointed. But failure feels like tuition for wisdom.',
          emotion: 'Resilience',
          people: ['Co-founder'],
          location: 'California',
          lifeStage: 'Adult',
          themes: ['Entrepreneurship', 'Failure', 'Learning'],
          summary: 'Startup failed but brought deeper lessons.'
        },
        {
          date: '2036-07-03',
          rawText: 'Promoted to lead a small engineering team. Leading people is harder than writing code. Listening matters more than talking.',
          emotion: 'Responsibility',
          people: ['Team'],
          location: 'Office',
          lifeStage: 'Adult',
          themes: ['Leadership', 'Career', 'Growth'],
          summary: 'Became engineering lead and learned value of empathy.'
        },
        {
          date: '2037-01-18',
          rawText: 'My child started school today. Watching them walk in confidently reminded me of my own first day years ago.',
          emotion: 'Pride',
          people: ['Child'],
          location: 'California',
          lifeStage: 'Parenthood',
          themes: ['Family', 'Growth', 'Legacy'],
          summary: 'Watched child start school and reflected on own journey.'
        },
        {
          date: '2038-04-02',
          rawText: 'Parents are aging. Noticed slower movements during video call. I felt a quiet fear about time slipping away.',
          emotion: 'Concern',
          people: ['Parents'],
          location: 'California',
          lifeStage: 'Adult',
          themes: ['Family', 'Aging', 'Time'],
          summary: 'Felt concern about parents growing older.'
        },
        {
          date: '2039-09-19',
          rawText: 'Visited India again. Spent simple evenings sitting with Appa talking about life. No big discussions — just presence.',
          emotion: 'Peace',
          people: ['Appa'],
          location: 'Tamil Nadu',
          lifeStage: 'Adult',
          themes: ['Family', 'Connection', 'Gratitude'],
          summary: 'Shared meaningful quiet time with father.'
        },
        {
          date: '2040-06-21',
          rawText: 'Turned 40 today. I don’t feel old — just layered. More patient, less reactive, more aware of what truly matters.',
          emotion: 'Acceptance',
          people: [],
          location: 'Home',
          lifeStage: 'Midlife',
          themes: ['Maturity', 'Reflection', 'Growth'],
          summary: 'Turned 40 and felt grounded maturity.'
        },
        {
          date: '2041-03-14',
          rawText: 'Mentored a young engineer who reminded me of my early days. Watching them grow feels like passing a torch.',
          emotion: 'Fulfillment',
          people: ['Junior Engineer'],
          location: 'Office',
          lifeStage: 'Midlife',
          themes: ['Mentorship', 'Legacy', 'Leadership'],
          summary: 'Mentored younger engineer and felt sense of legacy.'
        },
        {
          date: '2042-08-30',
          rawText: 'Launched another startup idea — this time slower, wiser. I care less about hype and more about sustainability.',
          emotion: 'Wisdom',
          people: ['Co-founder'],
          location: 'California',
          lifeStage: 'Midlife',
          themes: ['Entrepreneurship', 'Experience', 'Growth'],
          summary: 'Started new venture with maturity and patience.'
        },
        {
          date: '2043-12-25',
          rawText: 'Christmas dinner with family around one table. Laughter echoing. Moments like this feel like success beyond money.',
          emotion: 'Joy',
          people: ['Family'],
          location: 'Home',
          lifeStage: 'Midlife',
          themes: ['Family', 'Gratitude', 'Happiness'],
          summary: 'Family holiday dinner felt deeply fulfilling.'
        },
        {
          date: '2044-05-09',
          rawText: 'Health scare today — minor, but enough to remind me I’m not invincible. Started prioritizing sleep and exercise again.',
          emotion: 'Awareness',
          people: [],
          location: 'Hospital',
          lifeStage: 'Midlife',
          themes: ['Health', 'Mortality', 'Self Care'],
          summary: 'Minor health scare prompted lifestyle reflection.'
        },
        {
          date: '2045-01-01',
          rawText: 'Watched my child talk about their dreams. I realized my biggest achievement might not be code — but raising a confident human.',
          emotion: 'Gratitude',
          people: ['Child'],
          location: 'Home',
          lifeStage: 'Midlife',
          themes: ['Parenthood', 'Legacy', 'Meaning'],
          summary: 'Felt proud hearing child express bold dreams.'
        },
        {
          date: '2046-06-12',
          rawText: 'Lost a close relative today. Grief feels heavy and strange. Life feels fragile again.',
          emotion: 'Grief',
          people: ['Family'],
          location: 'India',
          lifeStage: 'Midlife',
          themes: ['Loss', 'Family', 'Mortality'],
          summary: 'Experienced deep grief after family loss.'
        },
        {
          date: '2047-09-08',
          rawText: 'Spent an evening revisiting old photos and journals. Younger me was so ambitious. I smile at that intensity.',
          emotion: 'Nostalgia',
          people: [],
          location: 'Home',
          lifeStage: 'Midlife',
          themes: ['Reflection', 'Growth', 'Identity'],
          summary: 'Reflected fondly on younger ambitious self.'
        },
        {
          date: '2048-02-20',
          rawText: 'My child left for college today. The house feels quieter. Pride and emptiness coexist.',
          emotion: 'Bittersweet',
          people: ['Child'],
          location: 'Home',
          lifeStage: 'Empty Nest',
          themes: ['Family', 'Transition', 'Pride'],
          summary: 'Child left for college, felt proud yet emotional.'
        },
        {
          date: '2048-11-11',
          rawText: 'Took a long walk alone, thinking about how fast decades move. Time is the most expensive currency.',
          emotion: 'Contemplative',
          people: [],
          location: 'Park',
          lifeStage: 'Midlife',
          themes: ['Time', 'Reflection', 'Mortality'],
          summary: 'Reflected deeply on the passage of time.'
        },
        {
          date: '2049-04-30',
          rawText: 'Started documenting my life stories more intentionally. I want future generations to know who I was beyond job titles.',
          emotion: 'Purpose',
          people: [],
          location: 'Home',
          lifeStage: 'Midlife',
          themes: ['Legacy', 'Identity', 'Family'],
          summary: 'Began consciously preserving personal life stories.'
        },
        {
          date: '2049-12-31',
          rawText: 'Closing the decade with gratitude. Success feels quieter now — more about peace than achievement.',
          emotion: 'Contentment',
          people: ['Family'],
          location: 'Home',
          lifeStage: 'Midlife',
          themes: ['Peace', 'Reflection', 'Gratitude'],
          summary: 'Ended decade feeling peaceful and grounded.'
        },
        {
          date: '2050-03-05',
          rawText: 'Turned 50 today. I don’t feel like I’ve “figured it all out.” But I feel stable, wiser, and deeply thankful.',
          emotion: 'Gratitude',
          people: ['Family'],
          location: 'Home',
          lifeStage: 'Midlife',
          themes: ['Milestone', 'Wisdom', 'Reflection'],
          summary: 'Turned 50 and embraced wisdom with gratitude.'
        }
    ];

function getDatesLast6Months(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < DEMO_MEMORIES.length; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 180));
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates.sort();
}

async function clearAllMemories(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const memoriesRef = collection(db, 'users', user.uid, 'memories');
  const snapshot = await getDocs(memoriesRef);
  const docs = snapshot.docs;
  const BATCH_SIZE = 500;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    docs.slice(i, i + BATCH_SIZE).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  if (docs.length > 0) {
    console.log('[Seed] Deleted', docs.length, 'memories');
  }
}

async function clearMediaStorage(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const mediaRef = ref(storage, `users/${user.uid}/media`);
  try {
    const result = await listAll(mediaRef);
    await Promise.all(result.items.map(item => deleteObject(item)));
    if (result.items.length > 0) {
      console.log('[Seed] Deleted', result.items.length, 'media files');
    }
  } catch (err: any) {
    if (err?.code !== 'storage/object-not-found') {
      console.log('[Seed] Media clear:', err?.message || err);
    }
  }
}

function removeUndefined(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      cleaned[key] = value.map(item =>
        item && typeof item === 'object' ? removeUndefined(item) : item
      );
    } else if (value && typeof value === 'object') {
      cleaned[key] = removeUndefined(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export async function resetAndSeedDemoMemories(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  await clearAllMemories();
  await clearMediaStorage();

  const dates = getDatesLast6Months();
  const batch = writeBatch(db);
  const now = Date.now();

  DEMO_MEMORIES.forEach((mem, i) => {
    const date = mem.date || dates[i] || dates[0];
    const memoryId = `${date}_${now + i}`;
    const fullMemory: Memory = {
      id: memoryId,
      date,
      rawText: mem.rawText,
      enhancedText: mem.enhancedText ?? null,
      emotion: mem.emotion ?? null,
      people: mem.people ?? [],
      location: mem.location ?? null,
      lifeStage: mem.lifeStage ?? null,
      themes: mem.themes ?? [],
      summary: mem.summary ?? null,
      mediaURLs: [],
      media: [],
      voiceTranscripts: [],
      createdAt: now + i,
      updatedAt: now + i,
    };
    const ref = doc(db, 'users', user.uid, 'memories', memoryId);
    batch.set(ref, removeUndefined(fullMemory as Record<string, any>));
  });

  await batch.commit();
  console.log('[Seed] Saved', DEMO_MEMORIES.length, 'demo memories');
  return DEMO_MEMORIES.length;
}
