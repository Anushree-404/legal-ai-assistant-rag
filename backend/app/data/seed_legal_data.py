"""
Seed the ChromaDB vector store with a curated legal knowledge base.
Run: python -m app.data.seed_legal_data
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from app.models.enums import LegalDomain, DocumentType
from app.services.document_processor import get_document_processor

LEGAL_DOCUMENTS = [
    # ── Constitutional Law ────────────────────────────────────────────────────
    {
        "title": "First Amendment — Freedom of Speech",
        "citation": "U.S. Const. amend. I",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.CONSTITUTIONAL,
        "jurisdiction": "federal",
        "content": """The First Amendment to the United States Constitution prohibits Congress from making any law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.

Freedom of Speech Doctrine:
The Supreme Court has interpreted the First Amendment to protect a wide range of expression. In Brandenburg v. Ohio, 395 U.S. 444 (1969), the Court held that the government cannot punish inflammatory speech unless it is directed to inciting and likely to produce imminent lawless action.

Categories of Unprotected Speech:
Not all speech is protected. The Supreme Court has identified several categories of unprotected speech:
1. Incitement to imminent lawless action (Brandenburg v. Ohio)
2. True threats (Virginia v. Black, 538 U.S. 343 (2003))
3. Obscenity (Miller v. California, 413 U.S. 15 (1973))
4. Defamation (New York Times Co. v. Sullivan, 376 U.S. 254 (1964))
5. Fighting words (Chaplinsky v. New Hampshire, 315 U.S. 568 (1942))
6. Child pornography (New York v. Ferber, 458 U.S. 747 (1982))

Content-Based vs. Content-Neutral Restrictions:
Content-based restrictions on speech are subject to strict scrutiny and must be narrowly tailored to serve a compelling government interest. Content-neutral restrictions (time, place, and manner restrictions) are subject to intermediate scrutiny.

Public Forum Doctrine:
In traditional public forums (streets, parks, sidewalks), the government may impose reasonable time, place, and manner restrictions but cannot engage in viewpoint discrimination.""",
    },
    {
        "title": "Fourth Amendment — Search and Seizure",
        "citation": "U.S. Const. amend. IV",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.CONSTITUTIONAL,
        "jurisdiction": "federal",
        "content": """The Fourth Amendment protects people from unreasonable searches and seizures by the government. It requires that warrants be judicially sanctioned and supported by probable cause.

Text: "The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized."

Warrant Requirement:
Generally, searches require a warrant based on probable cause. However, the Supreme Court has recognized numerous exceptions:

1. Search Incident to Lawful Arrest — Chimel v. California, 395 U.S. 752 (1969)
2. Plain View Doctrine — Horton v. California, 496 U.S. 128 (1990)
3. Exigent Circumstances — Brigham City v. Stuart, 547 U.S. 398 (2006)
4. Consent — Schneckloth v. Bustamonte, 412 U.S. 218 (1973)
5. Automobile Exception — Carroll v. United States, 267 U.S. 132 (1925)
6. Stop and Frisk — Terry v. Ohio, 392 U.S. 1 (1968)
7. Inventory Searches — South Dakota v. Opperman, 428 U.S. 364 (1976)

Exclusionary Rule:
Evidence obtained in violation of the Fourth Amendment is generally inadmissible under the exclusionary rule established in Mapp v. Ohio, 367 U.S. 643 (1961). The "fruit of the poisonous tree" doctrine extends this to derivative evidence.

Digital Privacy:
In Carpenter v. United States, 585 U.S. 296 (2018), the Supreme Court held that accessing historical cell phone location records constitutes a Fourth Amendment search, requiring a warrant.""",
    },

    # ── Criminal Law ──────────────────────────────────────────────────────────
    {
        "title": "Miranda Rights — Fifth and Sixth Amendment Protections",
        "citation": "Miranda v. Arizona, 384 U.S. 436 (1966)",
        "document_type": DocumentType.CASE_LAW,
        "domain": LegalDomain.CRIMINAL,
        "jurisdiction": "federal",
        "content": """Miranda v. Arizona, 384 U.S. 436 (1966) is a landmark Supreme Court decision establishing that criminal suspects must be informed of their constitutional rights before police interrogation.

The Miranda Warnings:
Before custodial interrogation, police must inform suspects:
1. You have the right to remain silent.
2. Anything you say can and will be used against you in a court of law.
3. You have the right to an attorney.
4. If you cannot afford an attorney, one will be appointed for you.

Custodial Interrogation:
Miranda applies when a suspect is (1) in custody and (2) subject to interrogation. "Custody" means formal arrest or restraint on freedom of movement to the degree associated with formal arrest (Berkemer v. McCarty, 468 U.S. 420 (1984)).

Waiver:
A suspect may waive Miranda rights if the waiver is voluntary, knowing, and intelligent (Colorado v. Spring, 479 U.S. 564 (1987)).

Invocation:
To invoke the right to silence, a suspect must unambiguously invoke it (Berghuis v. Thompkins, 560 U.S. 370 (2010)). To invoke the right to counsel, the request must be unambiguous (Davis v. United States, 512 U.S. 452 (1994)).

Consequences of Violation:
Statements obtained in violation of Miranda are generally inadmissible in the prosecution's case-in-chief but may be used for impeachment purposes (Harris v. New York, 401 U.S. 222 (1971)).""",
    },
    {
        "title": "Federal Criminal Code — Elements of Common Crimes",
        "citation": "18 U.S.C. §§ 1-2725",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.CRIMINAL,
        "jurisdiction": "federal",
        "content": """Federal Criminal Law Overview under Title 18 of the United States Code.

Murder (18 U.S.C. § 1111):
Murder is the unlawful killing of a human being with malice aforethought. First-degree murder includes premeditated killings and felony murder. Second-degree murder is all other murder.

Wire Fraud (18 U.S.C. § 1343):
Elements: (1) a scheme to defraud; (2) use of wire communications in furtherance of the scheme; (3) intent to defraud. Penalties: up to 20 years imprisonment (30 years if affecting a financial institution).

Mail Fraud (18 U.S.C. § 1341):
Similar to wire fraud but uses mail. The scheme to defraud must involve a material misrepresentation.

RICO — Racketeer Influenced and Corrupt Organizations Act (18 U.S.C. §§ 1961-1968):
Prohibits conducting an enterprise through a pattern of racketeering activity. Requires at least two predicate acts within 10 years. Civil RICO allows treble damages.

Computer Fraud and Abuse Act (18 U.S.C. § 1030):
Prohibits unauthorized access to protected computers. Covers hacking, identity theft, and cybercrime.

Mens Rea Standards:
- Specific intent: defendant must have intended the specific result
- General intent: defendant intended the act
- Strict liability: no mental state required (rare in federal law)
- Willfulness: conscious disregard of a known legal duty""",
    },

    # ── Contract Law ──────────────────────────────────────────────────────────
    {
        "title": "Contract Formation — Elements and Requirements",
        "citation": "Restatement (Second) of Contracts §§ 1-9",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.CONTRACT,
        "jurisdiction": "general",
        "content": """Contract Law Fundamentals — Formation Requirements

A valid contract requires four essential elements:

1. OFFER
An offer is a manifestation of willingness to enter into a bargain, made so as to justify another person in understanding that his assent to that bargain is invited and will conclude it (Restatement (Second) of Contracts § 24). An offer must be definite and certain in its terms.

2. ACCEPTANCE
Acceptance is a manifestation of assent to the terms of an offer made by the offeree in a manner invited or required by the offer. The mirror image rule requires acceptance to match the offer exactly. Under the UCC § 2-207, additional terms in acceptance may become part of the contract between merchants.

3. CONSIDERATION
Consideration is a bargained-for exchange where each party gives something of legal value. Past consideration is generally not valid. Moral obligation is generally not sufficient consideration. Promissory estoppel (Restatement § 90) may substitute for consideration when a party reasonably relies on a promise to their detriment.

4. MUTUAL ASSENT
Both parties must objectively manifest agreement to the same terms. Courts apply an objective standard — what a reasonable person would understand.

Defenses to Contract Formation:
- Fraud: misrepresentation of material fact with intent to deceive
- Duress: improper threat that leaves no reasonable alternative
- Undue influence: unfair persuasion by a dominant party
- Mistake: mutual mistake of material fact (Restatement § 152)
- Illegality: contracts for illegal purposes are void
- Lack of capacity: minors and mentally incapacitated persons

Statute of Frauds (UCC § 2-201):
Certain contracts must be in writing: contracts for sale of goods over $500, real estate contracts, contracts not performable within one year, surety agreements, and marriage contracts.""",
    },
    {
        "title": "Contract Breach and Remedies",
        "citation": "Restatement (Second) of Contracts §§ 235-272",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.CONTRACT,
        "jurisdiction": "general",
        "content": """Contract Breach and Available Remedies

TYPES OF BREACH:
1. Material Breach: A failure so significant that it defeats the purpose of the contract, excusing the non-breaching party from performance and entitling them to damages.
2. Minor/Partial Breach: A less significant failure that does not excuse the other party's performance but entitles them to damages.
3. Anticipatory Repudiation: A clear indication before performance is due that a party will not perform (Hochster v. De La Tour (1853)).

REMEDIES FOR BREACH:

Expectation Damages (Benefit of the Bargain):
The standard remedy placing the non-breaching party in the position they would have been in had the contract been performed. Includes:
- Direct damages: loss in value of performance
- Consequential damages: foreseeable losses flowing from breach (Hadley v. Baxendale (1854))
- Incidental damages: costs incurred in dealing with the breach

Reliance Damages:
Reimburse the non-breaching party for expenses incurred in reliance on the contract.

Restitution:
Prevents unjust enrichment by requiring the breaching party to return benefits conferred.

Specific Performance:
An equitable remedy ordering the breaching party to perform. Available when monetary damages are inadequate (e.g., unique goods, real property).

Liquidated Damages:
Pre-agreed damages are enforceable if: (1) actual damages were difficult to estimate at contract formation, and (2) the amount is a reasonable forecast of compensatory damages (not a penalty).

Duty to Mitigate:
The non-breaching party must take reasonable steps to minimize losses. Failure to mitigate reduces recoverable damages.""",
    },

    # ── Tort Law ──────────────────────────────────────────────────────────────
    {
        "title": "Negligence — Elements and Standards",
        "citation": "Restatement (Third) of Torts: Liability for Physical and Emotional Harm §§ 3-7",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.TORT,
        "jurisdiction": "general",
        "content": """Negligence Law — Elements, Standards, and Defenses

ELEMENTS OF NEGLIGENCE:
To establish negligence, a plaintiff must prove four elements:

1. DUTY OF CARE
The defendant owed a legal duty of care to the plaintiff. The general standard is the duty to act as a reasonably prudent person under the circumstances. Special relationships may create heightened duties (doctor-patient, employer-employee, common carrier-passenger).

2. BREACH OF DUTY
The defendant failed to meet the standard of care. The reasonable person standard is objective. In professional negligence (malpractice), the standard is that of a reasonably competent professional in the same field.

3. CAUSATION
- Actual cause (cause-in-fact): "But for" the defendant's conduct, the harm would not have occurred (but-for test). Substantial factor test applies when multiple causes exist.
- Proximate cause (legal cause): The harm must be a foreseeable result of the defendant's conduct. Intervening causes may break the chain of causation.

4. DAMAGES
The plaintiff must have suffered actual harm — physical injury, property damage, or in some cases, emotional distress.

DEFENSES TO NEGLIGENCE:
- Contributory negligence: plaintiff's own negligence bars recovery (minority rule)
- Comparative negligence: reduces plaintiff's recovery proportionally (majority rule)
  - Pure comparative: plaintiff recovers even if 99% at fault
  - Modified comparative: plaintiff barred if 50% or 51% at fault
- Assumption of risk: plaintiff voluntarily assumed a known risk
- Statute of limitations: typically 2-3 years for personal injury

NEGLIGENCE PER SE:
Violation of a statute designed to protect a class of persons from a specific type of harm constitutes negligence per se (Martin v. Herzog, 228 N.Y. 164 (1920)).""",
    },

    # ── Employment Law ────────────────────────────────────────────────────────
    {
        "title": "Title VII — Civil Rights Act of 1964 (Employment Discrimination)",
        "citation": "42 U.S.C. § 2000e et seq.",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.EMPLOYMENT,
        "jurisdiction": "federal",
        "content": """Title VII of the Civil Rights Act of 1964 — Employment Discrimination

OVERVIEW:
Title VII prohibits employment discrimination based on race, color, religion, sex, or national origin. It applies to employers with 15 or more employees, employment agencies, and labor organizations.

PROHIBITED CONDUCT:
1. Disparate Treatment: Intentional discrimination against an individual because of a protected characteristic. Established through the McDonnell Douglas burden-shifting framework (McDonnell Douglas Corp. v. Green, 411 U.S. 792 (1973)).

2. Disparate Impact: Facially neutral policies that disproportionately affect a protected group without business justification (Griggs v. Duke Power Co., 401 U.S. 424 (1971)).

3. Hostile Work Environment: Severe or pervasive conduct based on a protected characteristic that creates an abusive work environment (Meritor Savings Bank v. Vinson, 477 U.S. 57 (1986)).

4. Quid Pro Quo Harassment: Employment benefits conditioned on submission to sexual advances.

5. Retaliation: Adverse action against an employee for opposing discriminatory practices or participating in EEOC proceedings (42 U.S.C. § 2000e-3).

PREGNANCY DISCRIMINATION ACT (42 U.S.C. § 2000e(k)):
Prohibits discrimination based on pregnancy, childbirth, or related medical conditions.

SEXUAL ORIENTATION AND GENDER IDENTITY:
In Bostock v. Clayton County, 590 U.S. 644 (2020), the Supreme Court held that Title VII's prohibition on sex discrimination includes discrimination based on sexual orientation and gender identity.

ENFORCEMENT:
Employees must file a charge with the EEOC within 180 days (or 300 days in states with fair employment agencies) before filing suit. The EEOC may investigate, mediate, or issue a right-to-sue letter.

REMEDIES:
Back pay, front pay, compensatory damages (capped based on employer size), punitive damages, injunctive relief, and attorney's fees.""",
    },
    {
        "title": "Fair Labor Standards Act — Wage and Hour Law",
        "citation": "29 U.S.C. §§ 201-219",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.EMPLOYMENT,
        "jurisdiction": "federal",
        "content": """Fair Labor Standards Act (FLSA) — Wage and Hour Requirements

MINIMUM WAGE (29 U.S.C. § 206):
The federal minimum wage is $7.25 per hour (as of 2009). Many states and localities have higher minimum wages. Tipped employees may be paid a lower cash wage ($2.13/hour federal) if tips bring total compensation to minimum wage.

OVERTIME (29 U.S.C. § 207):
Non-exempt employees must receive 1.5x their regular rate for hours worked over 40 in a workweek. The regular rate includes most forms of compensation but excludes gifts, vacation pay, and certain bonuses.

EXEMPTIONS:
The FLSA exempts certain employees from minimum wage and overtime requirements:
1. Executive exemption: manages enterprise or department, directs 2+ employees, has authority to hire/fire, salary ≥ $684/week
2. Administrative exemption: office work directly related to management, exercises discretion and independent judgment, salary ≥ $684/week
3. Professional exemption: advanced knowledge in field of science or learning, salary ≥ $684/week
4. Outside sales exemption: primarily makes sales away from employer's place of business
5. Computer employee exemption: systems analysts, programmers, software engineers

CHILD LABOR (29 U.S.C. § 212):
Prohibits oppressive child labor. Children under 14 generally cannot work. Children 14-15 have restricted hours and prohibited occupations. Children 16-17 may work unlimited hours but not in hazardous occupations.

ENFORCEMENT:
The Department of Labor's Wage and Hour Division enforces the FLSA. Employees may also bring private lawsuits for back wages, liquidated damages (equal to back wages), and attorney's fees. The statute of limitations is 2 years (3 years for willful violations).""",
    },

    # ── Property Law ──────────────────────────────────────────────────────────
    {
        "title": "Real Property — Landlord-Tenant Law",
        "citation": "Restatement (Second) of Property: Landlord and Tenant",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.PROPERTY,
        "jurisdiction": "general",
        "content": """Landlord-Tenant Law — Rights, Obligations, and Remedies

TYPES OF TENANCIES:
1. Tenancy for Years: Fixed term with definite end date; terminates automatically
2. Periodic Tenancy: Continues for successive periods until proper notice given
3. Tenancy at Will: Either party may terminate at any time
4. Tenancy at Sufferance: Holdover tenant after lease expires

LANDLORD'S DUTIES:
1. Implied Warranty of Habitability: Landlord must maintain premises in livable condition (Javins v. First National Realty Corp., 428 F.2d 1071 (D.C. Cir. 1970)). Covers essential services: heat, water, electricity, structural safety.

2. Covenant of Quiet Enjoyment: Landlord must not interfere with tenant's peaceful possession. Constructive eviction occurs when landlord's actions make premises uninhabitable.

3. Duty to Disclose: Many states require disclosure of known defects, lead paint (42 U.S.C. § 4852d), and other hazards.

TENANT'S DUTIES:
1. Pay rent on time
2. Maintain premises in reasonable condition
3. Not commit waste
4. Comply with lease terms

SECURITY DEPOSITS:
Most states limit security deposits (typically 1-2 months' rent) and require return within 14-30 days after tenancy ends, with itemized deductions.

EVICTION PROCESS:
Landlord must provide proper notice (typically 3-30 days depending on reason), file unlawful detainer action if tenant doesn't vacate, obtain court judgment, and use sheriff/marshal for physical removal. Self-help eviction (changing locks, removing belongings) is illegal in most states.

FAIR HOUSING ACT (42 U.S.C. §§ 3601-3619):
Prohibits discrimination in housing based on race, color, national origin, religion, sex, familial status, and disability.""",
    },

    # ── Family Law ────────────────────────────────────────────────────────────
    {
        "title": "Family Law — Divorce, Custody, and Support",
        "citation": "Uniform Marriage and Divorce Act; State Family Codes",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.FAMILY,
        "jurisdiction": "general",
        "content": """Family Law — Divorce, Child Custody, and Support Overview

DIVORCE:
No-Fault Divorce: All states now permit no-fault divorce based on "irreconcilable differences" or "irretrievable breakdown" of the marriage. No showing of wrongdoing required.

Fault Grounds (still available in some states): adultery, cruelty, abandonment, imprisonment.

PROPERTY DIVISION:
Community Property States (AZ, CA, ID, LA, NV, NM, TX, WA, WI): Property acquired during marriage is equally owned by both spouses and divided 50/50 upon divorce.

Equitable Distribution States (majority): Courts divide marital property fairly, considering factors like length of marriage, contributions, economic circumstances, and future needs.

Separate Property: Property owned before marriage or received as gift/inheritance during marriage is generally not subject to division.

CHILD CUSTODY:
Legal Custody: Right to make decisions about child's education, healthcare, religion.
Physical Custody: Where child lives.

Best Interests of the Child Standard: Courts determine custody based on the child's best interests, considering:
- Child's age and health
- Parent-child relationships
- Each parent's ability to provide stability
- Child's adjustment to home, school, community
- Child's preference (if of sufficient age and maturity)
- History of domestic violence or abuse

CHILD SUPPORT:
All states use income-based guidelines. Federal law (42 U.S.C. § 667) requires states to use guidelines. Support continues until child reaches majority (18 or 21 in some states) or becomes emancipated.

SPOUSAL SUPPORT (ALIMONY):
Courts consider length of marriage, standard of living, each spouse's earning capacity, and contributions to the marriage. Types: temporary, rehabilitative, permanent, reimbursement.""",
    },

    # ── Civil Rights ──────────────────────────────────────────────────────────
    {
        "title": "42 U.S.C. § 1983 — Civil Rights Claims Against State Actors",
        "citation": "42 U.S.C. § 1983",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.CIVIL,
        "jurisdiction": "federal",
        "content": """42 U.S.C. § 1983 — Civil Action for Deprivation of Rights

TEXT: "Every person who, under color of any statute, ordinance, regulation, custom, or usage, of any State or Territory or the District of Columbia, subjects, or causes to be subjected, any citizen of the United States or other person within the jurisdiction thereof to the deprivation of any rights, privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured in an action at law, suit in equity, or other proper proceeding for redress."

ELEMENTS:
1. The defendant acted under color of state law
2. The defendant's conduct deprived the plaintiff of a right secured by the Constitution or federal law

COLOR OF STATE LAW:
Includes actions by state and local government officials acting in their official capacity. Private parties may act under color of state law if they are willful participants in joint activity with the state (Lugar v. Edmondson Oil Co., 457 U.S. 922 (1982)).

QUALIFIED IMMUNITY:
Government officials are entitled to qualified immunity unless they violated a "clearly established" statutory or constitutional right that a reasonable person would have known (Harlow v. Fitzgerald, 457 U.S. 800 (1982)).

MUNICIPAL LIABILITY (MONELL CLAIMS):
Municipalities are not liable under respondeat superior. Liability requires showing the constitutional violation resulted from an official policy or custom (Monell v. Department of Social Services, 436 U.S. 658 (1978)).

REMEDIES:
Compensatory damages, punitive damages (against individual defendants, not municipalities), injunctive relief, declaratory relief, and attorney's fees under 42 U.S.C. § 1988.

STATUTE OF LIMITATIONS:
Courts borrow the state's personal injury statute of limitations, typically 2-3 years.""",
    },

    # ── Intellectual Property ─────────────────────────────────────────────────
    {
        "title": "Copyright Law — Protection and Infringement",
        "citation": "17 U.S.C. §§ 101-1332",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.INTELLECTUAL_PROPERTY,
        "jurisdiction": "federal",
        "content": """Copyright Law under the Copyright Act of 1976 (17 U.S.C.)

WHAT IS PROTECTED (17 U.S.C. § 102):
Copyright protects original works of authorship fixed in a tangible medium of expression, including:
- Literary works
- Musical works
- Dramatic works
- Pictorial, graphic, and sculptural works
- Motion pictures and audiovisual works
- Sound recordings
- Architectural works

NOT PROTECTED: Ideas, facts, procedures, processes, systems, methods of operation, concepts, principles, or discoveries (idea-expression dichotomy).

DURATION (17 U.S.C. § 302):
Works created after January 1, 1978: Life of author + 70 years.
Works for hire: 95 years from publication or 120 years from creation, whichever is shorter.

EXCLUSIVE RIGHTS (17 U.S.C. § 106):
Copyright owners have exclusive rights to reproduce, distribute, create derivative works, publicly perform, and publicly display the work.

FAIR USE (17 U.S.C. § 107):
Fair use is a defense to infringement. Courts consider four factors:
1. Purpose and character of use (commercial vs. educational; transformative use)
2. Nature of the copyrighted work
3. Amount and substantiality of the portion used
4. Effect on the potential market for the original

INFRINGEMENT:
To prove infringement: (1) ownership of valid copyright; (2) copying of constituent elements of the work. Copying may be shown by access + substantial similarity.

REMEDIES (17 U.S.C. §§ 502-505):
Injunctive relief, actual damages and profits, statutory damages ($750-$30,000 per work; up to $150,000 for willful infringement), attorney's fees.""",
    },

    # ── Immigration Law ───────────────────────────────────────────────────────
    {
        "title": "Immigration Law — Visa Categories and Pathways to Citizenship",
        "citation": "8 U.S.C. §§ 1101-1537 (Immigration and Nationality Act)",
        "document_type": DocumentType.STATUTE,
        "domain": LegalDomain.IMMIGRATION,
        "jurisdiction": "federal",
        "content": """Immigration and Nationality Act (INA) — Overview

NONIMMIGRANT VISAS (8 U.S.C. § 1101(a)(15)):
- B-1/B-2: Business/tourism visitors
- F-1: Academic students
- H-1B: Specialty occupation workers (requires bachelor's degree or equivalent; annual cap of 65,000 + 20,000 for U.S. master's degree holders)
- H-2A: Temporary agricultural workers
- L-1: Intracompany transferees
- O-1: Individuals with extraordinary ability
- J-1: Exchange visitors

IMMIGRANT VISAS (GREEN CARDS):
Family-Based (8 U.S.C. § 1151): Immediate relatives of U.S. citizens (spouses, unmarried children under 21, parents) are not subject to annual caps. Other family preference categories have annual limits.

Employment-Based (8 U.S.C. § 1153):
- EB-1: Priority workers (extraordinary ability, outstanding professors/researchers, multinational managers)
- EB-2: Advanced degree professionals or exceptional ability
- EB-3: Skilled workers, professionals, unskilled workers
- EB-5: Immigrant investors ($800,000-$1,050,000 investment)

NATURALIZATION (8 U.S.C. § 1427):
Requirements: 5 years as lawful permanent resident (3 years if married to U.S. citizen), continuous residence, physical presence, good moral character, English language proficiency, knowledge of U.S. history and government.

REMOVAL (DEPORTATION) (8 U.S.C. § 1227):
Grounds include: criminal convictions, immigration violations, fraud. Individuals have right to removal proceedings before an immigration judge and may appeal to the Board of Immigration Appeals (BIA).

ASYLUM (8 U.S.C. § 1158):
Must apply within 1 year of arrival. Must show persecution or well-founded fear of persecution based on race, religion, nationality, political opinion, or membership in a particular social group.""",
    },
]


def seed_database():
    """Ingest all seed documents into the vector store."""
    processor = get_document_processor()
    print(f"Seeding {len(LEGAL_DOCUMENTS)} legal documents into the knowledge base...")

    for i, doc in enumerate(LEGAL_DOCUMENTS, 1):
        try:
            document_id, chunk_count = processor.ingest_text(
                content=doc["content"],
                title=doc["title"],
                document_type=doc["document_type"],
                domain=doc["domain"],
                citation=doc.get("citation"),
                jurisdiction=doc.get("jurisdiction"),
                url=doc.get("url"),
            )
            print(f"  [{i:2d}/{len(LEGAL_DOCUMENTS)}] ✓ {doc['title']} ({chunk_count} chunks)")
        except Exception as exc:
            print(f"  [{i:2d}/{len(LEGAL_DOCUMENTS)}] ✗ {doc['title']}: {exc}")

    print("\nSeeding complete!")


if __name__ == "__main__":
    seed_database()
