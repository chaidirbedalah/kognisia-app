# Project

## Gamification & Engagement Features PRD

### Introduction & Vision
#### Overview
This initiative aims to transform the solitary and stressful experience of UTBK \(university entrance exam\) preparation into an engaging, social, and habit\-forming journey\. By implementing a gamified ecosystem, we will shift the user experience from passive "drill\-and\-practice" to an active "earn\-and\-compete" model\.

#### Core Problem
Students preparing for UTBK often face burnout, lack of motivation, and a sense of isolation\. While the current platform provides content, it lacks the mechanisms to sustain long\-term engagement and daily retention\.

#### Vision & Goals
To build a "Strictly Earn\-to\-Play" ecosystem where academic effort is the only currency\.

**Primary Goal:** Increase Daily Active Users \(DAU\) and session duration\.

**Secondary Goal:** Create positive peer pressure through social features to reduce study isolation\.

**Key Mechanism:** Users must study individually to earn "Tickets," which are then used to access fun, social, and competitive game modes\.

### Target Audience & User Personas
**Primary User:** 12th\-grade High School students and Gap Year students aiming for Top State Universities \(PTN\)\.

#### Section
**Characteristics:**

Highly goal\-oriented but prone to burnout\.

Financially committed \(All users are Premium/Paid status\)\.

Digital natives familiar with game mechanics \(Mobile Legends, Duolingo\)\.

**Motivation:** Wants to prove competence, measure standing against peers, and find a support system\.

### Key Concepts & Definitions
Before detailing requirements, the following core economies are defined to govern the system:

#### Section
**XP \(Experience Points\):**

**Purpose:** Measures permanent academic progress and prestige\.

**Behavior:** Cumulative, never decreases\.

**Usage:** Determines User Level \(e\.g\., Level 1 "Pejuang" to Level 50 "Maba UI"\)\.

#### Section
**Tickets \(Energy/Access Currency\):**

**Purpose:** Gatekeeping currency for Social and Competitive features\.

**Behavior:** Consumable\. Earned via effort, spent on gameplay\.

**Constraint:** Cannot be purchased with money\. No Top\-ups\. Strictly earned through individual study\.

### Phase 1: Core Individual Gamification
This phase establishes the foundational "Earn" side of the economy\.

#### 1\.1 XP & Leveling System
The system must reward every academic action with XP to provide immediate feedback\.

TODO: Define the XP Progression Curve\.
Options:

##### Section
**XP Sources:**

Daily Challenge\.

**Leveling Titles:** Users shall be assigned titles based on their level range \(e\.g\., "Newbie," "Rookie," "Scholar," "Professor"\)\.

Linear progression \(Every level requires 1000 XP\)\. Pro: Predictable\. Con: Becomes boring at high levels\.

Exponential progression \(Level 1 needs 100 XP, Level 50 needs 10,000 XP\)\. Pro: meaningful high\-level achievements\. Con: Early grind might feel too fast\.

Tiered Steps \(Easy to level up early, plateaus at specific milestones\)\. Pro: Good retention hook for new users\.

#### 1\.2 Badges & Achievement System
The system must track specific milestones and award Badges based on a Material Tier system \(Bronze, Silver, Gold, Platinum, Diamond\)\.

##### Section
**Badge Categories:**

**Sniper:** Based on accuracy/consecutive correct answers\.

**Marathon:** Based on daily login streaks\.

**Speed Demon:** Based on average time\-to\-answer\.

**Sultan:** Based on total volume of questions answered\.

**Visibility:** Badges must be displayed on the User Profile to signal competence\.

#### 1\.3 Daily Challenges \(The Ticket Source\)
This is the critical "faucet" for the Ticket economy\.

TODO: Define Ticket Storage Caps\.
Options:

**Mechanism:** The system generates daily challenge, "Answer 10 questions," "Score >70% in Literacy"\.

**Reward:** Completion of these challenges awards **Tickets**\.

**Restriction:** Tickets cannot be obtained by simply logging in; academic output is required\.

Unlimited Storage\. Pro: Users can grind on weekends for later\. Con: Reduces daily urgency\.

Hard Cap \(e\.g\., Max 10 Tickets\)\. Pro: Forces regular consumption of social features\. Con: Users might lose earned rewards\.

Soft Cap \(production stops at cap, but rewards can overflow\)\. Pro: Balanced approach\.

### Phase 2: Study Groups \(Social Co\-op\)
This phase introduces the first use case for Tickets and the "Hybrid Economy\."

#### 2\.1 Temporary Lobby System
Users can create or join a "Study Group" lobby\.

**Duration:** Lobbies are temporary and dissolve after the session ends\.

**Capacity:** 4\-10 users per group\.

#### 2\.2 Entry & Economy Logic
**Entry Cost:** 1 Ticket is deducted immediately upon joining a lobby\.

**Completion Reward:** Upon successfully finishing the group study session, the user receives 2 Tickets\.

**Net Profit:** \+1 Ticket\.

**Goal:** This encourages users to leverage study groups not just for learning, but to "farm" tickets for the more expensive Battle modes \(Phase 3\)\.

#### 2\.3 Gameplay & Interaction
TODO: Clarify Disconnect/Dropout Policy for Study Groups\.
Options:

**Mode:** Co\-op/Parallel play\. All users face the same question set\.

**Scoring:** Individual scoring allows for an internal leaderboard, but the atmosphere is collaborative\.

**Anti\-Leech:** Users must answer a minimum percentage of questions to qualify for the Completion Reward\.

Forfeit: If a user disconnects, they lose their entry ticket and get no reward\. \(Pro: Strict\. Con: Punishes bad internet\)\.

Grace Period: User can reconnect within 2 minutes to resume\. \(Pro: Fair\. Con: Technical complexity\)\.

Partial Refund: System refunds the ticket if the server detects an error, but not user exit\. \(Pro: User friendly\. Con: Exploitable\)\.

### Phase 3: Team Battles \(Social Competitive\)
This phase acts as the "Ticket Sink" – the high\-stakes mode where users spend their earned tickets\.

#### 3\.1 Permanent Squads
Users can form permanent teams \(Clans/Squads\) with a unique name and logo\.

**Roster:** Max 5\-10 members\.

#### 3\.2 Battle System
**Entry Cost:** battling requires Tickets \(amount configurable, e\.g\., 2\-3 Tickets per battle\)\.

**Format:** Real\-time or Async\-Turn\-Based quiz battles against opposing squads\.

**Matchmaking:** Based on Squad Aggregate Level or ELO rating\.

#### 3\.3 Rewards & Stakes
**No Ticket ROI:** Unlike Study Groups, Battles generally do *not* reward Tickets \(or very rarely\)\. This ensures Battles are a "sink" that drains the economy, forcing users back to Individual Study \(Phase 1\) to reload\.

**Rewards:** Battles reward massive amounts of **XP**, unique **Badges**, and **Leaderboard Points** \(Season Ranking\)\.

### Non\-Functional Requirements
#### Usability
**Feedback Loop:** Gamification feedback \(visual/audio cues for XP gain\) must be immediate \(<200ms\) to ensure psychological gratification\.

**Clarity:** The distinction between XP \(Progress\) and Tickets \(Currency\) must be visually distinct in the UI \(e\.g\., XP Bar vs Ticket Counter\)\.

#### Security & Integrity
**Anti\-Cheat:** Since rankings are involved, the system must detect rapid\-fire answering patterns impossible for humans\.

**Economy Integrity:** The Ticket generation logic must be server\-side authoritative to prevent client\-side manipulation of currency\.

#### Performance
**Real\-time Sync:** For Phase 3 Battles, question synchronization between users must have low latency to ensure fairness\.

### Scope
#### In Scope
User Profile expansion \(XP, Levels, Badges\)\.

Daily Challenge engine\.

Ticket wallet and transaction ledger\.

Study Group lobby management\.

Team/Squad management structure\.

Leaderboards \(Global and Friends\)\.

#### Out of Scope
Monetization of Tickets \(In\-App Purchases for Tickets are explicitly excluded\)\.

Custom Avatar items or cosmetic shops \(deferred to future phases\)\.

Offline mode for Social features\.

### Success Metrics
#### Section
**Engagement Loop:**

Percentage of users completing Daily Challenges \(Source of Tickets\)\.

Ticket "Burn Rate" \(Are users spending tickets in Groups/Battles or hoarding them?\)\.

#### Section
**Retention:**

Day\-1, Day\-7, and Day\-30 Retention rates\.

#### Section
**Social Density:**

Average number of Study Group sessions per user per week\.

Percentage of users belonging to a Permanent Squad\.

### Assumptions & Dependencies
**Assumption:** All users have a valid Premium subscription \(business logic prerequisite\)\.

**Dependency:** The existing Content Management System \(CMS\) must be able to tag questions by difficulty to support the Badge system \(e\.g\., "Sniper" badge might require Hard questions\)\.

**Dependency:** A reliable push notification system is required to alert users when Study Groups are forming or Battles are starting\.