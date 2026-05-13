"""
Seed the Legal AI knowledge base.
Run: python seed.py
Requires OPENAI_API_KEY in backend/.env
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

# Import the store from server
from server import store, _split_text, CHUNK_SIZE, CHUNK_OVERLAP

LEGAL_DOCUMENTS = [
    {
        "title": "First Amendment — Freedom of Speech",
        "citation": "U.S. Const. amend. I",
        "document_type": "statute",
        "domain": "constitutional",
        "jurisdiction": "federal",
        "content": """The First Amendment prohibits Congress from making any law abridging freedom of speech, press, assembly, or petition.

Freedom of Speech Doctrine: In Brandenburg v. Ohio, 395 U.S. 444 (1969), the Court held the government cannot punish inflammatory speech unless directed to inciting and likely to produce imminent lawless action.

Unprotected Speech Categories:
1. Incitement to imminent lawless action (Brandenburg v. Ohio)
2. True threats (Virginia v. Black, 538 U.S. 343 (2003))
3. Obscenity (Miller v. California, 413 U.S. 15 (1973))
4. Defamation (New York Times Co. v. Sullivan, 376 U.S. 254 (1964))
5. Fighting words (Chaplinsky v. New Hampshire, 315 U.S. 568 (1942))

Content-Based vs. Content-Neutral Restrictions: Content-based restrictions are subject to strict scrutiny. Content-neutral time, place, and manner restrictions are subject to intermediate scrutiny.""",
    },
    {
        "title": "Fourth Amendment — Search and Seizure",
        "citation": "U.S. Const. amend. IV",
        "document_type": "statute",
        "domain": "constitutional",
        "jurisdiction": "federal",
        "content": """The Fourth Amendment protects against unreasonable searches and seizures and requires warrants supported by probable cause.

Warrant Exceptions:
1. Search Incident to Arrest — Chimel v. California, 395 U.S. 752 (1969)
2. Plain View — Horton v. California, 496 U.S. 128 (1990)
3. Exigent Circumstances — Brigham City v. Stuart, 547 U.S. 398 (2006)
4. Consent — Schneckloth v. Bustamonte, 412 U.S. 218 (1973)
5. Automobile Exception — Carroll v. United States, 267 U.S. 132 (1925)
6. Stop and Frisk — Terry v. Ohio, 392 U.S. 1 (1968)

Exclusionary Rule: Evidence obtained in violation of the Fourth Amendment is inadmissible (Mapp v. Ohio, 367 U.S. 643 (1961)).

Digital Privacy: Carpenter v. United States, 585 U.S. 296 (2018) held that accessing historical cell phone location records requires a warrant.""",
    },
    {
        "title": "Miranda Rights",
        "citation": "Miranda v. Arizona, 384 U.S. 436 (1966)",
        "document_type": "case_law",
        "domain": "criminal",
        "jurisdiction": "federal",
        "content": """Miranda v. Arizona established that suspects must be informed of constitutional rights before custodial interrogation.

Miranda Warnings:
1. You have the right to remain silent.
2. Anything you say can be used against you in court.
3. You have the right to an attorney.
4. If you cannot afford an attorney, one will be appointed.

Custody: Miranda applies when a suspect is in custody — formal arrest or restraint to the degree of formal arrest (Berkemer v. McCarty, 468 U.S. 420 (1984)).

Waiver: Must be voluntary, knowing, and intelligent (Colorado v. Spring, 479 U.S. 564 (1987)).

Invocation: Must be unambiguous (Berghuis v. Thompkins, 560 U.S. 370 (2010); Davis v. United States, 512 U.S. 452 (1994)).

Consequences: Statements obtained in violation are inadmissible in the prosecution's case-in-chief but may be used for impeachment (Harris v. New York, 401 U.S. 222 (1971)).""",
    },
    {
        "title": "Contract Formation — Elements and Requirements",
        "citation": "Restatement (Second) of Contracts §§ 1-9",
        "document_type": "statute",
        "domain": "contract",
        "jurisdiction": "general",
        "content": """A valid contract requires four elements:

1. OFFER: A manifestation of willingness to enter a bargain (Restatement § 24). Must be definite and certain.

2. ACCEPTANCE: Manifestation of assent matching the offer (mirror image rule). Under UCC § 2-207, additional terms in acceptance may become part of contracts between merchants.

3. CONSIDERATION: Bargained-for exchange where each party gives something of legal value. Past consideration is not valid. Promissory estoppel (Restatement § 90) may substitute when a party reasonably relies on a promise to their detriment.

4. MUTUAL ASSENT: Both parties must objectively manifest agreement to the same terms.

Defenses: Fraud, duress, undue influence, mutual mistake (Restatement § 152), illegality, lack of capacity.

Statute of Frauds (UCC § 2-201): Contracts for goods over $500, real estate, contracts not performable within one year, surety agreements must be in writing.""",
    },
    {
        "title": "Contract Breach and Remedies",
        "citation": "Restatement (Second) of Contracts §§ 235-272",
        "document_type": "statute",
        "domain": "contract",
        "jurisdiction": "general",
        "content": """Types of Breach:
1. Material Breach: Defeats the purpose of the contract, excusing the non-breaching party from performance.
2. Minor/Partial Breach: Does not excuse performance but entitles the non-breaching party to damages.
3. Anticipatory Repudiation: Clear indication before performance is due that a party will not perform (Hochster v. De La Tour (1853)).

Remedies:
- Expectation Damages: Places non-breaching party in position they would have been in had contract been performed. Includes direct damages, consequential damages (Hadley v. Baxendale (1854)), and incidental damages.
- Reliance Damages: Reimburse expenses incurred in reliance on the contract.
- Restitution: Prevents unjust enrichment.
- Specific Performance: Equitable remedy when monetary damages are inadequate (unique goods, real property).
- Liquidated Damages: Enforceable if actual damages were difficult to estimate and amount is a reasonable forecast.

Duty to Mitigate: Non-breaching party must take reasonable steps to minimize losses.""",
    },
    {
        "title": "Negligence — Elements and Standards",
        "citation": "Restatement (Third) of Torts §§ 3-7",
        "document_type": "statute",
        "domain": "tort",
        "jurisdiction": "general",
        "content": """Elements of Negligence (plaintiff must prove all four):

1. DUTY: Defendant owed a legal duty of care. General standard: reasonably prudent person. Special relationships create heightened duties (doctor-patient, employer-employee).

2. BREACH: Defendant failed to meet the standard of care. Professional negligence uses the standard of a reasonably competent professional in the same field.

3. CAUSATION:
   - Actual cause (but-for test): But for defendant's conduct, harm would not have occurred.
   - Proximate cause: Harm must be a foreseeable result of defendant's conduct.

4. DAMAGES: Plaintiff must have suffered actual harm.

Defenses:
- Contributory negligence: Plaintiff's own negligence bars recovery (minority rule).
- Comparative negligence: Reduces recovery proportionally (majority rule).
  - Pure: Plaintiff recovers even if 99% at fault.
  - Modified: Plaintiff barred if 50% or 51% at fault.
- Assumption of risk: Plaintiff voluntarily assumed a known risk.

Negligence Per Se: Violation of a statute designed to protect a class of persons constitutes negligence per se (Martin v. Herzog, 228 N.Y. 164 (1920)).""",
    },
    {
        "title": "Title VII — Employment Discrimination",
        "citation": "42 U.S.C. § 2000e et seq.",
        "document_type": "statute",
        "domain": "employment",
        "jurisdiction": "federal",
        "content": """Title VII of the Civil Rights Act of 1964 prohibits employment discrimination based on race, color, religion, sex, or national origin. Applies to employers with 15+ employees.

Prohibited Conduct:
1. Disparate Treatment: Intentional discrimination. Established through McDonnell Douglas burden-shifting (McDonnell Douglas Corp. v. Green, 411 U.S. 792 (1973)).
2. Disparate Impact: Neutral policies disproportionately affecting a protected group without business justification (Griggs v. Duke Power Co., 401 U.S. 424 (1971)).
3. Hostile Work Environment: Severe or pervasive conduct creating an abusive environment (Meritor Savings Bank v. Vinson, 477 U.S. 57 (1986)).
4. Quid Pro Quo Harassment: Employment benefits conditioned on sexual advances.
5. Retaliation: Adverse action for opposing discriminatory practices (42 U.S.C. § 2000e-3).

Sexual Orientation/Gender Identity: Bostock v. Clayton County, 590 U.S. 644 (2020) held Title VII covers sexual orientation and gender identity.

Enforcement: File EEOC charge within 180 days (300 days in deferral states) before filing suit.

Remedies: Back pay, front pay, compensatory damages (capped by employer size), punitive damages, injunctive relief, attorney's fees.""",
    },
    {
        "title": "Fair Labor Standards Act — Wage and Hour",
        "citation": "29 U.S.C. §§ 201-219",
        "document_type": "statute",
        "domain": "employment",
        "jurisdiction": "federal",
        "content": """FLSA establishes minimum wage, overtime, and child labor standards.

Minimum Wage (29 U.S.C. § 206): Federal minimum is $7.25/hour. Tipped employees may be paid $2.13/hour if tips bring total to minimum wage.

Overtime (29 U.S.C. § 207): Non-exempt employees must receive 1.5x regular rate for hours over 40 per workweek.

Exemptions (salary threshold ≥ $684/week):
1. Executive: Manages enterprise, directs 2+ employees, authority to hire/fire.
2. Administrative: Office work related to management, exercises independent judgment.
3. Professional: Advanced knowledge in field of science or learning.
4. Outside Sales: Primarily makes sales away from employer's place of business.
5. Computer Employee: Systems analysts, programmers, software engineers.

Child Labor (29 U.S.C. § 212): Under 14 generally cannot work. Ages 14-15 have restricted hours. Ages 16-17 cannot work in hazardous occupations.

Enforcement: DOL Wage and Hour Division. Private lawsuits for back wages, liquidated damages (equal to back wages), attorney's fees. Statute of limitations: 2 years (3 years for willful violations).""",
    },
    {
        "title": "Landlord-Tenant Law",
        "citation": "Restatement (Second) of Property: Landlord and Tenant",
        "document_type": "statute",
        "domain": "property",
        "jurisdiction": "general",
        "content": """Landlord's Duties:
1. Implied Warranty of Habitability: Maintain premises in livable condition (Javins v. First National Realty Corp., 428 F.2d 1071 (D.C. Cir. 1970)). Covers heat, water, electricity, structural safety.
2. Covenant of Quiet Enjoyment: Must not interfere with tenant's peaceful possession. Constructive eviction occurs when landlord's actions make premises uninhabitable.
3. Duty to Disclose: Known defects, lead paint (42 U.S.C. § 4852d), and other hazards.

Tenant's Duties: Pay rent on time, maintain premises, not commit waste, comply with lease terms.

Security Deposits: Most states limit to 1-2 months' rent and require return within 14-30 days with itemized deductions.

Eviction Process: Proper notice required (3-30 days depending on reason), then unlawful detainer action, court judgment, sheriff/marshal for physical removal. Self-help eviction (changing locks, removing belongings) is illegal in most states.

Fair Housing Act (42 U.S.C. §§ 3601-3619): Prohibits discrimination based on race, color, national origin, religion, sex, familial status, and disability.""",
    },
    {
        "title": "Family Law — Divorce, Custody, and Support",
        "citation": "Uniform Marriage and Divorce Act",
        "document_type": "statute",
        "domain": "family",
        "jurisdiction": "general",
        "content": """Divorce: All states permit no-fault divorce based on irreconcilable differences or irretrievable breakdown.

Property Division:
- Community Property States (AZ, CA, ID, LA, NV, NM, TX, WA, WI): Property acquired during marriage divided 50/50.
- Equitable Distribution States (majority): Courts divide marital property fairly considering length of marriage, contributions, economic circumstances.
- Separate Property: Property owned before marriage or received as gift/inheritance is generally not subject to division.

Child Custody:
- Legal Custody: Right to make decisions about education, healthcare, religion.
- Physical Custody: Where child lives.
- Best Interests Standard: Courts consider child's age/health, parent-child relationships, stability, child's preference (if mature), history of domestic violence.

Child Support: All states use income-based guidelines (42 U.S.C. § 667). Continues until majority (18 or 21) or emancipation.

Spousal Support (Alimony): Courts consider length of marriage, standard of living, earning capacity, contributions. Types: temporary, rehabilitative, permanent, reimbursement.""",
    },
    {
        "title": "42 U.S.C. § 1983 — Civil Rights Claims",
        "citation": "42 U.S.C. § 1983",
        "document_type": "statute",
        "domain": "civil",
        "jurisdiction": "federal",
        "content": """42 U.S.C. § 1983 provides a civil remedy for deprivation of constitutional rights by state actors.

Elements:
1. Defendant acted under color of state law.
2. Defendant's conduct deprived plaintiff of a right secured by the Constitution or federal law.

Color of State Law: Includes state and local government officials acting in official capacity. Private parties may qualify if willful participants in joint activity with the state (Lugar v. Edmondson Oil Co., 457 U.S. 922 (1982)).

Qualified Immunity: Officials are immune unless they violated a "clearly established" right a reasonable person would have known (Harlow v. Fitzgerald, 457 U.S. 800 (1982)).

Municipal Liability (Monell Claims): Municipalities are not liable under respondeat superior. Liability requires showing the violation resulted from an official policy or custom (Monell v. Department of Social Services, 436 U.S. 658 (1978)).

Remedies: Compensatory damages, punitive damages (against individuals, not municipalities), injunctive relief, declaratory relief, attorney's fees (42 U.S.C. § 1988).

Statute of Limitations: Borrows state's personal injury limitations period, typically 2-3 years.""",
    },
    {
        "title": "Copyright Law",
        "citation": "17 U.S.C. §§ 101-1332",
        "document_type": "statute",
        "domain": "intellectual_property",
        "jurisdiction": "federal",
        "content": """Copyright Act of 1976 protects original works of authorship fixed in a tangible medium.

Protected Works (17 U.S.C. § 102): Literary, musical, dramatic, pictorial/graphic/sculptural, audiovisual, sound recordings, architectural works.

NOT Protected: Ideas, facts, procedures, processes, systems, methods of operation (idea-expression dichotomy).

Duration (17 U.S.C. § 302): Life of author + 70 years. Works for hire: 95 years from publication or 120 years from creation.

Exclusive Rights (17 U.S.C. § 106): Reproduce, distribute, create derivative works, publicly perform, publicly display.

Fair Use (17 U.S.C. § 107) — Four factors:
1. Purpose and character of use (commercial vs. educational; transformative use)
2. Nature of the copyrighted work
3. Amount and substantiality of the portion used
4. Effect on the potential market for the original

Infringement: (1) ownership of valid copyright; (2) copying of constituent elements. Shown by access + substantial similarity.

Remedies (17 U.S.C. §§ 502-505): Injunctive relief, actual damages and profits, statutory damages ($750-$30,000 per work; up to $150,000 for willful infringement), attorney's fees.""",
    },
    {
        "title": "Immigration Law — Visas and Citizenship",
        "citation": "8 U.S.C. §§ 1101-1537 (INA)",
        "document_type": "statute",
        "domain": "immigration",
        "jurisdiction": "federal",
        "content": """Immigration and Nationality Act (INA) governs immigration to the United States.

Nonimmigrant Visas (8 U.S.C. § 1101(a)(15)):
- B-1/B-2: Business/tourism
- F-1: Academic students
- H-1B: Specialty occupation workers (cap: 65,000 + 20,000 for U.S. master's holders)
- L-1: Intracompany transferees
- O-1: Extraordinary ability
- J-1: Exchange visitors

Immigrant Visas (Green Cards):
- Family-Based: Immediate relatives of U.S. citizens (spouses, unmarried children under 21, parents) have no annual cap.
- Employment-Based: EB-1 (extraordinary ability), EB-2 (advanced degree), EB-3 (skilled workers), EB-5 (investors: $800,000-$1,050,000).

Naturalization (8 U.S.C. § 1427): 5 years as LPR (3 years if married to U.S. citizen), continuous residence, physical presence, good moral character, English proficiency, civics knowledge.

Removal (8 U.S.C. § 1227): Grounds include criminal convictions and immigration violations. Right to removal proceedings before immigration judge; appeals to BIA.

Asylum (8 U.S.C. § 1158): Must apply within 1 year of arrival. Must show persecution or well-founded fear based on race, religion, nationality, political opinion, or particular social group.""",
    },
]


def seed():
    if not store.chunks:
        print(f"Seeding {len(LEGAL_DOCUMENTS)} legal documents...")
        for i, doc in enumerate(LEGAL_DOCUMENTS, 1):
            import uuid as _uuid
            doc_id = str(_uuid.uuid4())
            meta = {
                "title": doc["title"],
                "citation": doc.get("citation", ""),
                "document_type": doc["document_type"],
                "domain": doc["domain"],
                "jurisdiction": doc.get("jurisdiction", "general"),
                "url": "",
                "document_id": doc_id,
            }
            _, chunks = store.add(doc["content"], meta)
            print(f"  [{i:2d}/{len(LEGAL_DOCUMENTS)}] ✓ {doc['title']} ({chunks} chunks)")
        print(f"\nDone! {store.count()} chunks indexed.\n")
    else:
        print(f"Knowledge base already has {store.count()} chunks. Skipping seed.")


if __name__ == "__main__":
    seed()
