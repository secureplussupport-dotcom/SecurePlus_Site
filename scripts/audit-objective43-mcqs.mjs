import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {publicationPipeline} from './lib/content-mapping/publication.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';

const scriptPath='scripts/audit-objective43-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective43-mcqs-proposals.json',reportPath='docs/phase-2b5-objective43-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective41-mcqs-proposals.json',firstPath='docs/drafts/phase-2b5-objective23-fastlane-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'b7a1c10defd100a7844d9595ecde31ba4d244679e90855afdac721dd47d05fa9');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
// Only substantive arrays overlay the frozen inventory; inspection references earn no credit.
for(const path of [firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json',basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
  assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const ranked=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('4.3')&&!c.previous.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
const selected=ranked.slice(0,19),deferred=ranked.slice(19),ids=["m722", "m725", "m423", "m023", "m074", "m128", "m243", "m244", "m262", "m426", "m628", "m173", "m349", "m425", "m174", "m071", "m160", "m172", "m241"];
assert.equal(ranked.length,19);assert.deepEqual(selected.map(r=>r.questionId),ids);assert.deepEqual(selected.map(r=>r.priorityScore),[130, 130, 65, 35, 35, 35, 35, 35, 35, 35, 30, 25, 25, 25, 20, 10, 10, 10, 10]);
const meanings=[
  "Identify STIX 2.1 representation and the compatible TAXII exchange role as one offered pairing, without demonstrating ingestion or verified intelligence.",
  "Choose a relevant threat-trend/business-impact assessment for executive investment decisions, without assessing an entire vulnerability-management process.",
  "Recognise the offered STIX/TAXII model/exchange pairing for machine-readable intelligence as one composite keyed decision.",
  "Choose contextual exposure, exploit evidence and business-impact assessment when prioritising a supplied 9.1 base-severity finding.",
  "Recognise the CVSS Environmental group for supplied deployment and security-requirement characteristics, keeping version and risk scope qualified.",
  "Interpret a supplied CVSS v3.1 9.1 score as Critical technical severity and retain contextual priority rather than a universal deadline.",
  "Choose current local correlation and source-confidence assessment before blocking a stale unsupported shared-hosting indicator.",
  "Use a stipulated tested reduction in reachable network attack paths to compare otherwise equivalent remediation priorities.",
  "Choose exposure assessment, feasible interim mitigation and expedited tested remediation for a supplied actively exploited exposed service.",
  "Explain greater patch/configuration visibility from sufficient approved host access under the supplied same-host same-time comparison.",
  "Classify the supplied missed real applicable update finding as a false negative, without certifying scanner or system security.",
  "Choose contextual exposure/control/business-impact assessment for a supplied High finding on an isolated test server.",
  "Distinguish identifying/prioritising weaknesses from an authorised adversarial attempt to demonstrate exploitation and impact.",
  "Explain different local risk priorities for the same CVE and supplied equal base severity by exposure, impact and control context.",
  "Recognise the CISA KEV catalogue as an exploitation-evidence input for prioritisation, without verifying a current binding deadline.",
  "Choose appropriate verification after installing a patch before routine finding closure, without treating one clean scan as proof.",
  "Choose a tested fixed dependency or suitable maintained replacement as the direct treatment of an applicable vulnerable component.",
  "Recognise approved credentialed scanning from supplied logged-in host enumeration, without approving complete or safe coverage.",
  "Recognise the supplied malicious-associated observable values as indicators for further investigation, not proof of compromise or attribution."
];
const holds=[
  "HOLD naming STIX/TAXII as explaining the whole 4.3 lifecycle, two independent protocol skills, automatic feed compatibility, authenticated access or trustworthy content. STIX 2.1 requires JSON support but its conceptual model is not limited to one serialization; older STIX XML teaching is not the same version. TAXII uses HTTPS, has its own JSON resources and may carry other supported content, so format/transport roles are useful shorthand rather than exclusive capabilities. Access, version/content negotiation, TLS trust, schema interpretation and source reliability remain separate. Current precise version/pair replaces snapshot generic JSON/XML, native-appliance and truncated SCAP teaching. Snapshot-only with no authored substitute. Strongly correlate m423 in one provisional family. No feed, parser, TLS exchange or indicator is tested.",
  "HOLD executive-product selection as the whole 4.3 vulnerability lifecycle, verified investment value, guaranteed foresight, or mutually exclusive strategic/operational/tactical intelligence tiers. Audiences and products overlap; immediate indicators and investigation detail can contribute to an executive assessment but are not a complete long-term risk view on their own. Relevance, evidence, uncertainty, exposure and decision requirements matter. Current product choice replaces snapshot tier-name options and behavioural-intelligence-is-never-recognised assertion. Snapshot-only, source domain 3 to 4 and medium to easy are uncalibrated. No ROI, board decision, intelligence collection or operational response is observed.",
  "HOLD a pair-name answer as whole 4.3 vulnerability-management understanding, two separately scored skills, working interoperability or verified threat content. STIX/TAXII versions, object semantics, supported content, access policy and HTTPS trust must match actual implementations. CEF/LEEF event logs may contain security indicators and feed an intelligence workflow, but do not supply the offered adversary model plus exchange specification. SNMP/MIB and CVSS/NVD have different primary roles without universal data-sharing exclusivity. Current shorter options remove acronym expansions and keep the same decision; source domain 2 to 4. Same provisional family as m722: near-repeat teaching, zero new independence. No subscription, appliance, feed or exchange is tested.",
  "HOLD CVSS base severity as complete business risk, an internal label or firewall count as proof of reduced risk, a compulsory numeric downgrade, or environmental severity as identical to remediation priority. Validate reachable paths, control effectiveness, asset/dependency impact, threat evidence and policy; an internal foothold can change exposure. Current decision replaces authored High-is-certain classification and fixed effective-risk inference from three firewall layers. No vector or actual control evidence is supplied for recalculation, and no mathematical score change is approved. Strongly correlate m173/m425; these are one provisional contextual-priority family. No server, score calculation, firewall or remediation is tested.",
  "HOLD metric-group naming as whole 4.3 lifecycle understanding, an Environmental score as complete business risk, or local metrics as always reducing severity. The stem omits a version while Threat/Supplemental options and wrong teaching use v4.0; v3.1 instead has Temporal metrics. Environmental exists in both, so the key remains supportable but other-group distinctions need an explicit version. Confidentiality requirements and modified technical metrics are not arbitrary firewall-count or monetary-loss multipliers. Current question removes authored definite High downgrade and obsolete mixed group/subscore options. Correlate m023/m173/m425 but do not merge group naming with actual priority decisions or approve recalculation. No CVSS vector, asset or risk calculation is performed.",
  "HOLD supplied band lookup as whole vulnerability-management competence, Critical as proof of remote-code execution, a universal immediate highest priority or mandatory 30/90-day policy. The stem explicitly supplies the Critical range; it tests interpreting that provided classification, not calculating a vector or recalling the band independently. Exploitability, local impact/exposure and applicable obligations determine action. Current option/main remove authored universal immediate urgency; source domain 2 to 4 and medium to easy are uncalibrated. One combined severity/context answer grants no separate components. No vulnerability, vector, deadline, exploit or prioritisation outcome is verified.",
  "HOLD machine-readable/commercial feeds as authoritative evidence, a shared-IP match as confirmed compromise/exfiltration, missing dates as proof of harmlessness, or multiple copied feeds as independent corroboration. Assess first/last seen, provenance, source reliability, current local activity, false-positive consequences and decision requirements; legitimate shared services can be affected by blanket blocking. Current validation decision replaces authored overloaded tier classification from TTP/STIX/actor-profile mixture. Strategic/tactical/technical names are not assessed now. Correlate m241 indicator naming and m722/m423 exchange without equating format with truth. No feed, blocking rule, connection, incident or exfiltration is tested.",
  "HOLD internal placement as CVSS Attack Vector Local, a restrictive rule label as proven enforcement, fewer paths as immunity, or access controls as fixing the vulnerable code. The current premise supplies comparable assets, equal business impact and tested restrictions; allowed managed hosts may themselves be compromised and indirect paths still matter. Cost can affect treatment planning but is not proof of reduced exploit likelihood/impact; age and old scans create no safe downgrade. Current wording removes authored unverified internal-isolation inference. Correlate contextual priority m023/m173/m425, with the narrower verified-control comparison retained. No host, rule, reachability probe, vector or priority change executes.",
  "HOLD a universal 15-day KEV rule, every Critical finding as one fixed SLA, a released patch as deployed/validated remediation, or interim controls as eliminating every exploit path. Applicable deadlines, emergency authority, business continuity, rollback and actual mitigation coverage remain requirements; validation/compromise investigation can be needed. This is one composite response choice, not independently scored assessment/mitigation/patching skills. Current scenario removes authored blanket framework 15-to-30-day and 24-to-72-hour claims. Historic BOD 22-01 statements are not a verified current deadline: a September 2026 CISA bulletin refers to BOD 26-04, whose full requirements were not retrievable here. Preserve the unresolved current-policy hold rather than inferring supersession details. No service, policy, patch, attack or interim control is changed.",
  "HOLD credentials as guaranteed findings, extra findings as universally more accurate, authentication as permission for arbitrary exploitation or powered-off hosts as reachable. Privilege/endpoint/tool/plugin coverage, safe scan scope, actual host responses and applicability validation still matter. Current same-time/sufficient-access premise removes authored weekly-versus-quarterly confound and the wrong-feedback claim that cadence could never explain a disparity. Banners can be inspected without host login, and scan positioning/cadence elsewhere remain relevant. Correlate m172 method naming and m628 result validation without independent authentication/scanning components. No credentials, login, scan, offline host or finding is tested.",
  "HOLD outcome-label recognition as whole 4.3 confirmation/management competence, every missing update as an applicable vulnerability, or clean reports as secure systems. The key depends on the follow-up audit genuinely confirming an applicable unremediated condition in the same scope/time; supersedence, backports, tool coverage and stale observations can change interpretation. Compensating controls may reduce exposure without making a genuinely present missing-update finding disappear. No sensitivity/error-rate estimate follows from this one case. Current main removes imported page artifact and adds applicability/coverage limits; three fallback wrong corrections become specific. Imported QB1 question 28, medium to easy uncalibrated. No scanner, audit, update or host result is independently verified.",
  "HOLD isolated/internal/test labels as verified risk reduction, automatic lower severity/priority, universal High-within-24-hours deadlines, or no production data as no important impact. Isolation must be validated against accounts, allowed paths, pivoting and dependencies; threat evidence, policy and operational impact can matter even for test assets. Current key/main remove authored mandatory significant reduction. The unchanged stem lacks a version/vector, so no exact CVSS recalculation is justified. Same provisional family as m023/m425: strongly correlated contextual-priority teaching, not independent examples merely from a different score. No asset, score, deadline or priority is changed.",
  "HOLD vulnerability assessment and penetration testing as universally disjoint tools/actions, assessments as never using intrusive validation, or every penetration test as successful exploitation of every flaw. Actual authorisation, scope, safe methods and stop rules determine activities; tests may end without demonstrating impact and scanning can be part of penetration testing. Current options/main remove authored absolute external/internal, manual/automatic, infrastructure/application and never-exploitation divisions. Narrow purpose contrast can explain an identification activity but not the whole 4.3 lifecycle. Preserve prior m647/m157/m417 method/phase and coverage qualifications. No scan, exploit, written authorisation, application or report is executed.",
  "HOLD every CVE as having one globally authoritative CVSS base score, local risk priority as necessarily a computed Environmental score, equal base score as equal risk, or scanner/report metadata as never useful context. Analysts/sources/versions/vectors can differ; the premise explicitly supplies equal base scores so current key asks about local risk context. A date alone is not exploit maturity, but changing threat information over time can affect real priority. Current distractors remove authored one-official-score and credential-confidence-never-affects-priority guarantees. Same provisional contextual-priority family as m023/m173, no new independence. No CVE assessment, risk formula, scanner account, ticket or deadline is changed.",
  "HOLD catalogue naming as whole 4.3 lifecycle understanding, inclusion as a compromise in this organisation or continuing activity against every asset, absence as safe/unexploited, or one universal federal/private deadline. KEV inclusion supplies reported exploitation evidence; match actual affected products/configurations and current applicable requirements. Effective main still names BOD 22-01. A CISA bulletin dated September 11 2026 instead cites BOD 26-04 and FCEB scope; its full directive was inaccessible. Thus current policy/supersession/deadlines remain unresolved, not certified by historical 22-01 references. Current stem removes agency-deadline wording but the main requires this precise teaching hold. Source hard to easy uncalibrated. No live catalogue count, entry, affected host, legal advice or deadline is verified.",
  "HOLD a rescan alone as definitive elimination of all vulnerability/impact, every installation success as effective remediation, or routine-notification feedback as exemption from applicable incident/operational communication. Confirm applicability, current coverage, restarted/running state and appropriate configuration/functional evidence; scanner misses or stale results can persist. Authored mandatory-rescan-confirms-resolution guarantee is superseded by current appropriate validation. Two existing wrong corrections still describe broad notification as rarely appropriate and archiving as housekeeping; required notifications and change records can proceed alongside verification. No compromised-state investigation or learner recovery is established. No patch, rescan, ticket, notification or closure is performed.",
  "HOLD an SBOM entry/CVE/three-year age as verified reachable vulnerability, latest/maintained as fixed and compatible, replacing as automatically safe, or WAF/monitoring/encryption as universally irrelevant. Match package/version/configuration and affected code; backports or unused paths can affect applicability. Verify transitive components, build/runtime deployment, compatibility and actual fix coverage. Current main adds testing/deployment/verification and removes authored exposed-regardless-of-controls guarantee. A maintained replacement may retain the same flaw unless assessed. WAF may buy time on supported paths but does not repair code; encryption may constrain a specific impact without fixing the flaw. One composite choice, no separate SBOM/patch/verification credit. No inventory, package, WAF, application or update executes.",
  "HOLD naming the scan type as whole 4.3 lifecycle competence, valid credentials as sufficient permission, comprehensive findings as guaranteed, or credentialed as necessarily internal-only. Approval, least privilege, support, safe checks, reachable host and validated results govern visibility; unauthenticated scans can run internally too. Current main narrows authored more-comprehensive/accurate guarantees and adds permission/coverage limits; new specific wrong corrections contrast host login with traffic observation and human assessment. Same provisional family as m426 host visibility but naming is a narrower recognition task, not an independent authenticated-access skill. No credential, remote login, scan or social test is performed.",
  "HOLD IoC naming as the whole 4.3 lifecycle, every IP/domain/hash as uniquely malicious, a match as confirmed compromise/exfiltration, or indicators alone as actor attribution. Value context, time, provenance, shared infrastructure, file variation and local telemetry matter. TTPs/attack-pattern models can contain relationships to observable data, but their primary behavioural role differs from these particular values; a CVE identifies a vulnerability, not every indicator. Current main replaces authored detect-and-attribute promise with freshness/context qualification and adds specific wrong corrections. Correlate m243 validation and m722/m423 representation/exchange without independent detection/attribution credit. No feed, lookup, indicator match, incident or actor is verified."
];
const mainTeaching=[
  "STIX models the intelligence and compatible TAXII exchanges it; version, permissions and evidence quality remain requirements.",
  "Executive investment decisions need relevant threat trends and business consequences, with evidence and uncertainty.",
  "STIX represents threat objects and TAXII exchanges compatible content; one paired recognition answer is not an implemented feed.",
  "Use technical severity as an input alongside verified local exposure, threats, impact and policy; no predetermined downgrade follows.",
  "Environmental metrics reflect local deployment/security requirements; the other offered group definitions are v4.0-specific.",
  "The provided v3.1 range makes 9.1 Critical; it does not establish every organisation's remediation deadline.",
  "Validate a feed's freshness, reliability and relevance against local evidence and operational impact before acting.",
  "Verified access restrictions can reduce exposure without changing a network flaw into a local one or removing it.",
  "Escalate the supplied exploitation/exposure evidence, reduce feasible exposure and expedite tested remediation under applicable requirements.",
  "Approved sufficient host access exposes package/patch/configuration evidence under this controlled comparison; findings still require validation.",
  "Missing a genuinely present applicable finding is a false negative; neither this label nor a clean report certifies security.",
  "Assess real isolation, exposure, controls, threats and business impact; no guaranteed downgrade or universal High deadline follows.",
  "Assessment prioritises weaknesses and penetration testing attempts authorised adversarial validation; methods can overlap and success is not guaranteed.",
  "Equal supplied base scores can support different priorities when verified local exposure, impact and controls differ.",
  "KEV identifies reported exploitation evidence useful for priority; applicability, compromise and current directive deadlines remain separate.",
  "Verify the effective remediation with appropriate rescanning and additional checks before routine closure; retain required communications.",
  "Confirm applicability, test a fixed version or replacement, deploy and verify it; interim controls do not repair the dependency.",
  "Approved credentialed scanning can inspect host state within actual permissions/tool coverage; the label does not prove completeness.",
  "Indicators are investigation leads whose associations require current context and corroboration."
];
const contrasts=[
  [
    "Reversing the offered representation/exchange roles does not identify this pairing; TAXII still has its own resource representation.",
    "CVSS severity and CVE identifiers do not form the described intelligence model/exchange service.",
    "SCAP assessment content and LDAP directory access are different primary functions; integrations do not make them universally incapable of carrying related data."
  ],
  [
    "Immediate block indicators alone omit the requested longer-term business assessment.",
    "Packet-level investigation steps can inform an assessment but are not themselves the requested executive decision product.",
    "Parser settings enable data processing; they do not supply a business-risk assessment."
  ],
  [
    "SNMP/MIB primarily describes managed-device state, rather than the requested intelligence model/exchange pair.",
    "CEF/LEEF format events and can carry relevant observations, but do not provide this threat model and exchange protocol.",
    "CVSS measures vulnerability severity and NVD catalogues vulnerability data; they are not the asked intelligence-model/exchange pair."
  ],
  [
    "A base score does not include the complete local business-risk assessment.",
    "An internal system can remain reachable through compromised accounts or lateral movement; informational is not automatic.",
    "Firewall-layer count is not a scoring formula; actual enforcement and appropriate versioned metrics matter."
  ],
  [
    "Base metrics describe intrinsic vulnerability characteristics rather than local deployment requirements.",
    "Threat is a v4.0 group for exploit maturity/activity; v3.1 uses different Temporal terminology.",
    "Supplemental is v4.0 context that does not modify the score; Environmental is the local-severity group."
  ],
  [
    "9.1 exceeds the offered High classification; CVSS itself does not set a universal 30-day deadline.",
    "The supplied range rules out Medium; 90 days is not a universal CVSS rule.",
    "Unknown exploit activity does not retroactively change the provided base severity to Low."
  ],
  [
    "A structured feed does not make an undated assertion accurate or permanent blocking proportionate.",
    "Shared infrastructure requires context; it does not make every feed observation useless.",
    "A connection does not establish transferred contents, malicious intent or confirmed exfiltration."
  ],
  [
    "Age alone does not establish lower current exploit activity or urgency.",
    "Patch labour cost can affect treatment choices, but does not itself reduce likelihood or impact.",
    "An older scan adds uncertainty rather than proving reduced risk."
  ],
  [
    "Waiting for an annual audit does not address the supplied active exposed risk.",
    "Routine quarterly scheduling without reassessment ignores the supplied new exploitation evidence.",
    "Vendor availability does not mean deployment and effective remediation in this environment."
  ],
  [
    "Advertised banners can be inspected without host login and omit local state.",
    "Credentialed scanning does not grant authority to exploit every potential finding.",
    "Credentials cannot make a powered-off host reachable over the described connection; offline sources are a different method."
  ],
  [
    "A false positive reports an absent issue; the stipulated scanner missed a real one.",
    "A true positive would report the real applicable condition.",
    "A true negative requires the issue actually to be absent, contrary to the confirmed premise."
  ],
  [
    "Base severity does not provide the whole local risk/deadline decision.",
    "Internal placement does not exclude compromised identities or lateral movement.",
    "Applicable policy/obligations set deadlines, rather than a universal rule for High findings."
  ],
  [
    "Both activities may use internal or external positions within scope.",
    "Either can combine manual analysis and automation.",
    "Both can assess applications and infrastructure according to scope."
  ],
  [
    "Formatting alone does not alter likelihood or business consequences.",
    "A local report date alone does not establish a risk difference; real changing threat evidence can.",
    "Ticket identifiers track work, rather than defining exposure or impact."
  ],
  [
    "CVSS severity alone is not evidence of exploitation in the wild.",
    "NVD vulnerability information is not this specific CISA exploitation-evidence catalogue.",
    "ATT&CK models behaviours/techniques rather than this specific CVE catalogue and its action dates."
  ],
  [
    "An installation/ticket status alone does not justify closure without suitable remediation evidence.",
    "A blanket routine user notification is not the offered verification step; required incident/change communication still applies.",
    "Archiving can support housekeeping/recovery but does not verify the vulnerable condition is gone."
  ],
  [
    "A WAF can constrain supported reachable attacks but does not remove vulnerable code or cover every path.",
    "Monitoring can reveal attempts, but detection alone does not fix the dependency.",
    "Encryption protects specified data states and may constrain impact; it does not repair the library flaw."
  ],
  [
    "Unauthenticated probing lacks the specified logged-in host-state access, though positioning can be internal or external.",
    "The offered passive network observation does not itself log in and query host configuration.",
    "Social engineering concerns human responses rather than the described authenticated software enumeration."
  ],
  [
    "TTPs primarily describe methods/behaviours rather than the supplied specific observable values.",
    "CVEs identify disclosed vulnerabilities instead of this collection of infrastructure/file indicators.",
    "Attack patterns describe recurring techniques; the offered values are indicators and may be related to those patterns."
  ]
];
const preciseHolds=[
  "whole_numbered_STIX_TAXII_naming_version_and_compatibility",
  "whole_numbered_executive_intelligence_product_scope_and_uncertainty",
  "whole_numbered_pair_naming_and_correlated_STIX_TAXII",
  "context_priority_not_automatic_severity_downgrade",
  "whole_numbered_Environmental_naming_and_unstated_CVSS_version",
  "whole_numbered_supplied_severity_band_lookup_and_deadlines",
  "indicator_correlation_not_format_authority_or_confirmed_compromise",
  "verified_reachability_not_Local_attack_vector_or_code_fix",
  "composite_exploited_service_response_and_unverified_current_deadlines",
  "controlled_scan_comparison_not_universal_credential_accuracy",
  "whole_numbered_false_negative_naming_and_update_applicability",
  "internal_test_context_not_automatic_downgrade_or_deadline",
  "assessment_penetration_purpose_not_disjoint_methods_or_guaranteed_success",
  "same_CVE_not_one_global_score_or_Environmental_equals_risk",
  "whole_numbered_KEV_naming_and_current_BOD_teaching_unresolved",
  "rescan_not_security_proof_or_notification_exemption",
  "SBOM_applicability_and_maintained_replacement_not_automatic_fix",
  "whole_numbered_scan_naming_permissions_and_coverage",
  "whole_numbered_IoC_naming_context_and_no_attribution_proof"
];
const roles=[
  "threat_representation_exchange_pair_recognition",
  "executive_intelligence_product_choice",
  "threat_representation_exchange_pair_recognition",
  "contextual_remediation_priority_choice",
  "CVSS_environmental_group_recognition",
  "provided_CVSS_v31_severity_interpretation",
  "threat_indicator_validation_choice",
  "verified_exposure_priority_comparison",
  "exploited_service_interim_response_choice",
  "credentialed_scan_visibility_explanation",
  "scanner_outcome_label_recognition",
  "contextual_remediation_priority_choice",
  "assessment_adversarial_validation_purpose_comparison",
  "contextual_remediation_priority_explanation",
  "KEV_exploitation_catalogue_recognition",
  "post_patch_validation_step_choice",
  "dependency_remediation_choice",
  "credentialed_scan_method_recognition",
  "threat_observable_indicator_recognition"
];
const families=[
  "STIX_TAXII_representation_exchange_pair",
  "executive_threat_business_impact_product",
  "STIX_TAXII_representation_exchange_pair",
  "contextual_vulnerability_remediation_priority",
  "CVSS_environmental_metric_group_recognition",
  "provided_CVSS_severity_band_interpretation",
  "contextual_threat_indicator_validation",
  "verified_attack_path_priority_comparison",
  "exploited_exposed_service_response_choice",
  "credentialed_scan_host_visibility",
  "scanner_false_negative_result_recognition",
  "contextual_vulnerability_remediation_priority",
  "assessment_penetration_validation_purpose",
  "contextual_vulnerability_remediation_priority",
  "KEV_exploitation_evidence_source_recognition",
  "post_patch_effectiveness_validation",
  "applicable_dependency_fix_or_replacement",
  "credentialed_scan_host_visibility",
  "threat_observable_indicator_recognition"
];
const scopes=[
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "4.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_vulnerability_activity_understanding_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "4.3"
    ],
    "status": "held_whole_numbered_definition_catalogue_metric_or_product_scope"
  }
];
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();
assert.equal(selected.filter(r=>r.flags.stemChanged).length,8);assert.equal(selected.filter(r=>r.flags.optionsChanged).length,11);assert.deepEqual(selected.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m628']);
const questionProposals=selected.map((row,i)=>{
  const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);
  assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
  for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
  assert.equal(q.correct,s.preQuestion.correct);
  if(i<2){assert.equal(s.snapshots.length,1);assert.equal(s.captures.length,1);const replay=publicationPipeline(c.bank).overrides(s.snapshots).mcqs.find(x=>x.id===q.id),{_baseOrder,_adminOrder,...semantics}=replay;assert.equal(sig(semantics),row.revisions.localEffective);assert.equal(s.pub._adminOrder,s.captures[0].sort_order);assert.equal(s.authored,null);}else{assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);}
  return{recordId:row.recordId,questionId:q.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:i<2,sourceLayerDisposition:i<2?'snapshot_only_no_authored_or_imported_substitute':'authored_equals_preeditorial_but_differs_from_effective',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',assessedUnderstanding:meanings[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],skillRoleProposal:roles[i],numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:families[i],familyStatus:'provisional_comparison_no_independence_approval',optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0}};
});
assert.equal(questionProposals.filter(r=>r.snapshotReplayChecked).length,2);assert.equal(questionProposals.filter(r=>r.revisions.authored===null).length,2);
const explanationProposals=questionProposals.map((parent,i)=>{
  const s=c.questions.get(parent.recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
  return{recordId:'explanation:'+parent.recordId,kind:'explanation_bundle',parentId:parent.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:parent.sourceRevision,parentPublishedRevision:parent.publishedRecordSignature,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:mainTeaching[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],withheldPreciseContrast:preciseHolds[i],roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:contrasts[i][k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('4.3')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,86);assert.equal(old.length,7);assert.deepEqual(counts(old),{glossary_definition:7});assert.equal(selectedIds.size,38);assert.equal(remaining.length,41);assert.equal(broad.filter(r=>r.kind==='mcq').length,19);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.deepEqual(remaining.filter(r=>r.kind==='pbq').map(r=>r.id),['pbq:p001','pbq:p020','pbq:p064','pbq:p075','pbq:p080','pbq:p086','pbq:p226']);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,7);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),priorFeedback=bankRows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,258);assert.equal(priorFeedback.length,258);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,priorQuestions:258,newQuestions:19,combinedQuestions:277,remainingQuestions:206,combinedMcqs:261,remainingMcqs:134,combinedLocalPbqs:16,remainingLocalPbqs:72,pairedFeedbackCombined:277,pairedFeedbackRemaining:206};
assert.equal(priorQuestions.filter(r=>r.kind==='mcq').length+19,bankProgress.combinedMcqs);assert.equal(priorQuestions.filter(r=>r.kind==='pbq').length,16);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective41HeldDispositions:base.explanationProposals.filter(r=>r.withheldPreciseContrast).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal}))};
assert.equal(priorHolds.objective41HeldDispositions.length,12);assert.equal(priorHolds.inheritedHolds.objective33HeldDispositions.length,8);assert.equal(priorHolds.inheritedHolds.inheritedHolds.objective32FinalHeldDispositions.length,8);assert.equal(priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.objective32PriorityHeldDispositions.length,6);
const prior7=old.map(r=>({recordId:r.id,sourceRevision:r.sourceSignature,priorPacketPath:c.previous.get(r.id).path,priorDispositionRevision:sig(c.previous.get(r.id).row),status:'prior_substantive_reference_no_new_credit'}));
const comparisonSpecs=[
  {
    "ids": [
      "mcq:m722",
      "mcq:m423",
      "mcq:m725",
      "mcq:m241",
      "mcq:m243"
    ],
    "meaning": "m722/m423 repeat a single STIX/TAXII paired-recognition decision in one provisional family. Executive product selection, observable naming and confidence/context validation are different tasks. Format, encryption and commercial source do not make assertions reliable or establish compromise; indicators can contribute across audiences. No independent representation/exchange/detection/attribution or executive ROI credit."
  },
  {
    "ids": [
      "mcq:m023",
      "mcq:m173",
      "mcq:m425",
      "mcq:m244",
      "mcq:m074",
      "mcq:m128",
      "mcq:m174",
      "mcq:m262"
    ],
    "meaning": "m023/m173/m425 strongly correlate in one contextual-priority family. m244 narrows to supplied tested reachability; m074 names a version-dependent metric group and m128 interprets a supplied band. KEV evidence and exploited-service response complement prioritisation but do not establish universal deadlines or complete business risk. Current CISA bulletin/older BOD teaching remains held without a live policy decision."
  },
  {
    "ids": [
      "mcq:m172",
      "mcq:m426",
      "mcq:m628",
      "mcq:m349",
      "mcq:m647",
      "mcq:m157",
      "mcq:m417"
    ],
    "meaning": "m172/m426 share provisional host-visibility teaching, with naming narrower than explaining a controlled comparison. False-negative labelling and adversarial-validation purpose differ from complete detection or successful exploitation. Static/IaC inspection, credentialed scans and penetration tests can coexist with different artifacts/permissions; preserve prior method/scope/coverage/phase holds, no scanner or enforcement proof."
  },
  {
    "ids": [
      "mcq:m071",
      "mcq:m160",
      "mcq:m262",
      "mcq:m261"
    ],
    "meaning": "Post-patch effectiveness validation, applicable dependency repair, interim exploited-service response and WAF parsing alignment are related treatment activities with different stated triggers. WAF/monitoring can constrain supported exposure but do not fix vulnerable code; a maintained package or installation message alone does not verify remediation. Preserve existing input/control boundaries; no separate intervention/recovery or deployment credit."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const r=c.records.get(id),p=c.previous.get(id);assert(r);return{recordId:id,sourceRevision:r.sourceSignature,localRevision:r.localRevisionSignature??null,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null,status:selectedIds.has(id)?'current_substantive_disposition':p?'prior_disposition_reference_only':'inspection_only_no_new_credit'};}),newFamilyCredit:0,independenceApproved:false}));
const priorBatchComparisons=base.questionProposals.map(r=>{assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);return{recordId:r.recordId,sourceRevision:r.sourceRevision,publishedRecordSignature:r.publishedRecordSignature,feedbackRevision:c.records.get('explanation:'+r.recordId).sourceSignature,priorDecisionRevision:sig(r),status:'prior_substantive_reference_no_new_credit'};});
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'f27508097df273025cd5891ee4707eeb544affa4',sourceBindings:[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective41-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective41-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)}],triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,baselinePriorQuestions:125,substantiveOverlayPackets:[firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json',basePath].map(path=>({path,sha256:hashFile(path)})),currentPriorQuestions:258},bankSignature:c.ledger.bankSignature,selectionPolicy:'All 19 undispositioned objective 4.3 MCQs by existing triage priority then record ID; structural cues do not prove correctness or semantic error',selectedQuestionRecordIds:ids.map(id=>'mcq:'+id),selectedFeedbackRecordIds:ids.map(id=>'explanation:mcq:'+id),deferredObjective43QuestionRecordIds:deferred.map(r=>r.recordId),questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorBatchComparisons,priorObjective43Dispositions:prior7,priorHolds,objective43Census:census,objective43Denominator:{broadCandidates:86,priorAgentDispositions:7,newAgentDispositions:38,combinedAgentDispositions:45,remaining:41,remainingByKind:counts(remaining)},remainingObjective43RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};

function validate(value){
  assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);assert.deepEqual(value.sourceBindings,packet.sourceBindings);
  assert.equal(value.status,'LOCAL_AGENT_REVIEW_NOT_READY');assert.equal(value.baselineCommit,packet.baselineCommit);assert.equal(value.bankSignature,packet.bankSignature);assert.deepEqual(value.instructionalProposals,[]);
  assert.deepEqual(value.selectedQuestionRecordIds,selected.map(r=>r.recordId));assert.deepEqual(value.selectedFeedbackRecordIds,selected.map(r=>'explanation:'+r.recordId));assert.deepEqual(value.deferredObjective43QuestionRecordIds,deferred.map(r=>r.recordId));
  assert.equal(new Set([...value.questionProposals,...value.explanationProposals].map(r=>r.recordId)).size,38);assert.equal(value.questionProposals.length,19);assert.equal(value.explanationProposals.length,19);
  for(const [i,r]of value.questionProposals.entries()){
    const s=c.questions.get(selected[i].recordId);assert.equal(r.recordId,selected[i].recordId);assert(!c.previous.has(r.recordId));assert.deepEqual(r.revisions,s.row.revisions);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);
    assert.deepEqual(r.capturedOverrideBindings,s.row.capturedOverrides);assert.equal(r.snapshotReplayChecked,s.snapshots.length>0);assert.deepEqual(r.triageFlags,s.row.flags);assert.equal(r.sourcePriority,s.row.priorityScore);assert.equal(r.difficultyObserved,s.q.difficulty);assert.equal(r.difficultyDisposition,'source_label_uncalibrated');assert.equal(r.familyStatus,'provisional_comparison_no_independence_approval');assert.equal(r.sourceLayerDisposition,questionProposals[i].sourceLayerDisposition);assert.deepEqual(r.optionShuffleProbe,questionProposals[i].optionShuffleProbe);assert.equal(r.assessedUnderstanding,meanings[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.skillRoleProposal,roles[i]);assert.equal(r.numberOfKeyedDecisions,1);assert.equal(r.familyLabelProposal,families[i]);
    assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence'])assert.equal(r[f],false);
  }
  for(const [i,r]of value.explanationProposals.entries()){
    const s=c.questions.get(selected[i].recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(r.recordId,'explanation:'+s.row.recordId);assert.equal(r.parentId,s.row.recordId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.row.revisions.localEffective);assert.equal(r.parentPublishedRevision,s.record.sourceSignature);assert.equal(r.mainCorrectionRevision,sig(q.exp));assert.equal(r.wrongFeedbackRevision,sig(q.wrongFeedback));assert.equal(r.mainTeachingUnderstanding,mainTeaching[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.withheldPreciseContrast,preciseHolds[i]);assert.equal(r.deliveryGate,base.feedbackGate);
    assert.equal(r.distractorCorrections.length,3);for(const [k,d]of r.distractorCorrections.entries()){assert.equal(d.choiceRevision,sig(q.opts[indices[k]]));assert.equal(d.correctionRevision,sig(q.wrongFeedback[indices[k]]));assert.equal(d.teachingRationale,contrasts[i][k]);assert.equal(d.assessedSecondary,false);assert.equal(d.weight,0);}
    assert.equal(r.roleProposal,'conditional_parent_feedback_not_assessed_secondary');assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);assert.deepEqual(r.conceptLinkProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence','approvedRemediation','learnerObservedRecovery'])assert.equal(r[f],false);
  }
  assert.deepEqual(value.objective43Census,census);assert.deepEqual(value.remainingObjective43RecordIds,remaining.map(r=>r.id));assert.deepEqual(value.objective43Denominator,packet.objective43Denominator);assert.deepEqual(value.bankProgress,bankProgress);assert.deepEqual(value.separateAssessmentDenominator,packet.separateAssessmentDenominator);
  assert.deepEqual(value.priorObjective43Dispositions,prior7);assert.deepEqual(value.priorHolds,priorHolds);assert.deepEqual(value.comparisonGroups,comparisons);assert.deepEqual(value.priorBatchComparisons,priorBatchComparisons);assert.deepEqual(value.triageLedgerBinding,packet.triageLedgerBinding);assert.deepEqual(value.deliveryBindings,base.deliveryBindings);assert.equal(value.practiceSelectorBinding,base.practiceSelectorBinding);assert.equal(value.feedbackGate,base.feedbackGate);
  for(const f of ['activationAllowed','humanApproved','published','eligibleEvidence','scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved','tooltipDeliveryObserved'])assert.equal(value[f],false);assert.equal(value.masteryWeight,0);assert.equal(value.unchangedReleaseHashes,25);assert.equal(value.activeUnresolvedMappingsUnchanged, 489);
}
validate(packet);
let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet,'Negative mutation must actually change the packet');assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<19;i++){
  reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);
  reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);
  reject(p=>p.questionProposals[i].contentQualification='');
  reject(p=>p.questionProposals[i].revisions.authored=p.questionProposals[i].revisions.authored===null?p.questionProposals[i].revisions.preEditorialSnapshotMerged:null);
  reject(p=>p.questionProposals[i].snapshotReplayChecked=!p.questionProposals[i].snapshotReplayChecked);
  reject(p=>p.questionProposals[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);
  reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);reject(p=>p.questionProposals[i].optionShuffleProbe.feedbackRemapChecked=false);
  reject(p=>p.explanationProposals[i].roleProposal='assessed_secondary');
  reject(p=>p.questionProposals[i].sourcePriority=0);reject(p=>p.questionProposals[i].familyLabelProposal='independent_new_family');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.questionProposals[i].triageFlags.optionsChanged=!p.questionProposals[i].triageFlags.optionsChanged);
  reject(p=>p.explanationProposals[i].parentLocalRevision=p.questionProposals[(i+1)%19].sourceRevision);
  reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%19].sourceRevision);
  for(let k=0;k<3;k++)reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');
}
for(const [i,h]of preciseHolds.entries())if(h)reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);for(const i of [0, 1, 2, 4, 5, 10, 14, 17, 18])reject(p=>p.questionProposals[i].objectiveScopeProposal.assessedCodes=['4.3']);
// Each inherited contrast is independently removable in a negative probe; the full chain stays bound.
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);
for(const path of holdPaths)reject(p=>{let target=p.priorHolds;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{const old=p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
reject(p=>p.questionProposals[0].newFamilyCredit=1);reject(p=>p.questionProposals[0].humanApproved=true);reject(p=>p.questionProposals[0].primaryConceptProposal='invented');reject(p=>p.questionProposals[0].independentEvidence=true);
reject(p=>p.explanationProposals[0].deliveryGate='free_before_submission_all_options');reject(p=>p.explanationProposals[0].approvedRemediation=true);reject(p=>p.explanationProposals[0].distractorCorrections[0].assessedSecondary=true);reject(p=>p.explanationProposals[0].masteryWeight=1);
reject(p=>p.selectedQuestionRecordIds[18]=selected[0].recordId);reject(p=>p.questionProposals.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.deferredObjective43QuestionRecordIds.push(selected[0].recordId));
reject(p=>p.objective43Census.pop());reject(p=>p.objective43Census.push(p.objective43Census[0]));reject(p=>p.objective43Census.find(r=>r.recordId===remaining[0].id).status='new_agent_disposition_pending_owner');reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.separateAssessmentDenominator.privateVariants=0);
reject(p=>p.priorObjective43Dispositions.pop());reject(p=>p.priorBatchComparisons.pop());reject(p=>p.questionProposals[0].objectiveScopeProposal={assessedCodes:['4.3','2.4'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[7].skillRoleProposal='independent_control_component');reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
reject(p=>p.status='READY');reject(p=>p.baselineCommit='stale');reject(p=>p.bankSignature='stale');reject(p=>p.instructionalProposals.push({recordId:'invented'}));
packet.negativeMutationChecks=negativeMutationChecks;
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(packet,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),packet,'Packet/source disposition drift');
const report=[
  '# Phase 2B-5 — objective 4.3 MCQs and paired feedback',
  '**NOT READY.** Local draft review only. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. A pending agent disposition means the source was reviewed and its limits recorded. It does not approve owner decisions, learner scoring, canonical concepts or production activation. Only the packet, report and focused audit change.',
  'MCQ means multiple-choice question. Paired feedback includes the main explanation and corrections for each wrong choice. A hold marks a claim that must stay unapproved; it does not delete the question or change what learners currently see.',
  '## Exact selection and counts',
  '**Nineteen** current undispositioned effective MCQs, ordered by priority descending then record ID: **'+ids.join(', ')+'**. Scores: **130, 130, 65, 35, 35, 35, 35, 35, 35, 35, 30, 25, 25, 25, 20, 10, 10, 10, 10**. All nineteen effective stems, keys, options, main explanations and three wrong-choice corrections per question have been read alongside their available source layers. Sufficient local source evidence exists for every review; **zero question deferrals**. Qualifications below retain ambiguity rather than pretending it is resolved. Priority is a work-order cue, not correctness or review approval.',
  'Objective 4.3 broad source-tag union: **86 records; 7 prior + 38 new = 45 pending agent dispositions; 41 remain**. The prior seven are glossary definitions, not previously reviewed questions. New work is **19 questions + 19 paired feedback bundles**. All nineteen tagged MCQs and feedback now have pending judgments, including holds. Remaining: **seven PBQs (p001, p020, p064, p075, p080, p086, p226), seven paired feedback and 27 support/instructional records**.',
  '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
  'Bank: **258 prior + 19 new = 277/483 questions**, with **277 paired feedback bundles** pending owner. These comprise **261/395 MCQs + 16/88 local PBQs**. **206 questions and 206 paired feedback remain: 134 MCQs + 72 local PBQs**. The broad census includes support records; those are not extra reviewed questions. Two private variants, nine starter assessments and two guest demos keep their separate denominator. Comparisons, shuffles and machine inventory earn no additional review credit.',
  '## What each question can establish',
  questionProposals.map(r=>'**'+r.questionId+' — priority '+r.sourcePriority+'.** '+r.assessedUnderstanding+'\n\n'+r.contentQualification).join('\n\n'),
  '## Source changes and every correction',
  'm722/m725 are snapshot-only with null authored identities. Each has one captured override and one snapshot; **two actual publication-pipeline replays** reproduce the effective editorial semantics and captured order. Their false authored-change flags do not imply unchanged stems, options or feedback. No authored or imported substitute is invented. The other seventeen authored revisions equal their preeditorial revisions. All nineteen effective revisions differ from preeditorial sources; every keyed position remains unchanged, which does not establish unchanged decision meaning. m628 is imported **QB1 question 28**.',
  'Eight authored-relative stem-change flags: **m023/m074/m128/m243/m244/m262/m426/m174**. Eleven option-change flags: **m423/m023/m074/m128/m243/m244/m262/m426/m173/m349/m425**. m023/m173 remove automatic priority downgrades; m074 names Environmental with v4-style other groups; m128 supplies the v3.1 band and removes universal deadlines; m243 replaces overloaded intelligence-tier categorisation with indicator validation; m244 explicitly supplies tested restrictions and comparable assets; m262 replaces fixed SLA speculation with an exploited-service response; m426 controls the time/access comparison; m174 removes deadline wording from its stem while retaining the older BOD reference in main teaching. m423 abbreviates its pair options, m349 narrows purpose distinctions, and m425 replaces unsupported score-source/account-confidence distractors. The two snapshot questions change materially too: m722 supplies STIX 2.1 and compatible exchange, while m725 replaces tier names with executive product selection.',
  'Authored m423/m128/m243/m244/m262/m426/m425/m241 move domain 2 → effective 4; m160 moves 3 → 4. Snapshot m725 moves 3 → 4. Difficulty: m128 medium → easy, m243/m262/m160 hard → medium, m628 medium → easy, m174 hard → easy, and snapshot m725 medium → easy. All nineteen observed difficulty labels remain uncalibrated; no scoring changes.',
  'Ten authored rows lacked wrong-feedback bundles: **m128/m243/m244/m262/m173/m349/m174/m160/m172/m241** now have three current corrections each. m628 replaces three imported fallback corrections and removes a page artifact. m423/m023/m074/m426/m425 have authored answer-specific corrections to compare; m071 changes its main and first wrong correction while retaining the other two broad notification/housekeeping corrections. Both snapshot-only rows replace older wrong teaching. Current semantic qualifications address freshness, versioned metrics, scope/authorisation, applicability and policy; editorial differences themselves grant no approval.',
  explanationProposals.map((r,i)=>'**'+ids[i]+' main teaching:** '+r.mainTeachingUnderstanding+'\n\nThree selected-wrong contrasts, in effective option-index order: '+r.distractorCorrections.map((d,k)=>(k+1)+'. '+d.teachingRationale).join(' ')).join('\n\n'),
  '**57 current wrong corrections** bind their choice, correction, main explanation, full bundle and parent local/published revisions. **Nineteen precise holds** remain, one per question: pair/version/interoperability; executive-product scope; correlated pair naming; automatic CVSS downgrade; unspecified CVSS version; supplied severity lookup/deadlines; indicator validation; network reachability/Attack Vector; composite exploited-service response/current policy; controlled scan visibility; false-negative applicability; internal-test downgrade; assessment/penetration overlap; score-source versus risk; KEV/current BOD teaching; rescan/notification limits; dependency applicability/fix; scan naming/permissions; IoC context/attribution. Full per-question details are above.',
  'Nine whole numbered definition/catalogue/metric/product scopes (**m722/m725/m423/m074/m128/m628/m174/m172/m241**) retain 4.3 context with no assessed code. The other ten narrow vulnerability-activity judgments are inferred pending owner, not whole-objective competence. The current 4.3 objective asks for explaining activities; these holds concern the breadth demonstrated by the answer, not an invented requirement that every question execute a tool. m423/m722 each select one protocol pair; m262 and m160 each select one composite response. No independent protocol, assessment, remediation or validation component is scored. No alternate forced code, canonical role/concept/family, independence, weight, approved remediation or learner recovery is granted.',
  'Nineteen actual fixed-randomness pure shuffles preserve the keyed choice, choice multiset and selected-wrong correction remapping. Existing MCQPractice/shuffle/wrong-feedback source units and practice-selector signatures match the prior bindings. Main feedback is submitted-Pro gated; wrong feedback depends on the selected wrong choice. No browser entitlement, tooltip, disabled-option, pool/set/guest delivery or learner result is observed. No feed, parser, scanner/login, indicator lookup/block, threat attribution, CVSS calculation, firewall test, dependency update, patch, compromise investigation, penetration attempt, ticket closure or notification is performed. Fictional premise evidence is not our live observation.',
  '## Family comparisons and primary references',
  comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
  'Three repeated teaching groups keep provisional shared families: **m722/m423** STIX/TAXII paired recognition; **m023/m173/m425** contextual remediation priority; **m172/m426** credentialed host visibility, with a narrower naming task in m172. m244 specifically supplies verified attack-path reduction rather than generic internal placement. Metric naming, supplied severity-band interpretation, KEV recognition and an exploited-service response are related but distinct decisions. IoC naming is not validation or attribution; package repair is not a tested post-patch result. No generic topic bucket supplies a canonical merge or independent evidence.',
  '[CompTIA SY0-701 v7 §4.3](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) covers explaining vulnerability identification, analysis, response, validation and reporting activities. A single named term can support teaching without demonstrating that broad lifecycle. The selected source tags are preserved; narrower scope proposals remain inferred pending owner.',
  '[OASIS STIX 2.1](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html) requires JSON serialization support while defining the model independently of serialization. [TAXII 2.1](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html) uses HTTPS and version negotiation/access rules, with its own JSON resources. Our m722/m423 inference retains interoperability and trust qualifications rather than equating two names with a working reliable feed.',
  '[FIRST CVSS v3.1 specification](https://www.first.org/cvss/v3.1/specification-document) defines its severity bands and Base/Temporal/Environmental groups. [CVSS v4.0 specification](https://www.first.org/cvss/v4.0/specification-document) instead has Base/Threat/Environmental/Supplemental groups and keeps complete business-risk factors outside the score. Our judgments do not compute a vector, mandate downgrades or infer one universal remediation deadline. The unstated version in m074 remains held.',
  '[NVD source-acceptance assessment](https://nvd.nist.gov/vuln/cvmap/how-we-assess-acceptance-levels) compares CNA and NVD metric assessments. This contradicts the superseded m425 assertion that one CVE always has one official score; the current premise explicitly supplies equal base scores and asks about local priority. The NVD page body was unavailable to the browser tool; its official indexed description supported this limited comparison, not a specific live CVE lookup.',
  '[FIRST source evaluation](https://www.first.org/global/sigs/cti/curriculum/source-evaluation) and [intelligence analysis](https://www.first.org/global/sigs/cti/curriculum/machine-human) address reliability, relevance and contextual interpretation. Our m243/m241/m725 inference retains uncertainty and source validation. Machine-readable or commercial indicators alone are not verified compromise, attribution or executive investment value.',
  '[NIST SP800-115](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf) distinguishes host/network scan visibility and authorised adversarial validation, while identifying scope and accuracy limitations. [NIST SP800-40r4](https://csrc.nist.gov/pubs/sp/800/40/r4/final) includes verifying patch installation in enterprise patch management. Our scan, dependency and post-patch judgments retain applicability/permission/coverage limits instead of approving a clean-scan security certificate or deployed fix.',
  '**Unresolved current-policy teaching:** older [CISA August 2025 bulletin](https://www.cisa.gov/news-events/alerts/2025/08/12/cisa-adds-three-known-exploited-vulnerabilities-catalog) describes BOD 22-01 due dates and FCEB scope. CISA\'s [September 11 2026 official bulletin](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/429c4f7) instead references BOD 26-04, continued KEV use and FCEB-specific requirements. Direct directive/catalogue pages were inaccessible. This supports holding m174\'s current BOD teaching and m262\'s deadline assumptions, not asserting the full new rules or exact supersession. KEV naming remains reviewable; no live entry/count, affected host, actual deadline, private-sector obligation or current compliance certification is claimed. No learner content is changed.',
  '## Preserved gates and remaining work',
  'All twelve prior 4.1 precise holds remain, including MAM/MDM command limits, object/action policy, EAP trust, script enforcement, public-object scope, static compilation, shift-left economics, COPE/CYOD, HSTS and SQL binding. All eight 3.3 and fourteen 3.2 holds remain. The full source-bound chain preserves eleven 3.1 holds and earlier objective2.5/2.4/2.3/2.2, actor/supplier, crypto/PKI/PFS, channels, Unicode, PBQ grammar/grading, delivery and targeting qualifications. New judgments clear none.',
  '4.3 remains **41/86** unreviewed records: seven PBQs, seven feedback and 27 support. 4.1 remains **160/203**: one PBQ, one feedback and 158 support; 3.3 remains **130/164**: two PBQs, two feedback and 126 support; 3.2 remains **137/220**: five PBQs, five feedback and 127 support; 3.1 remains **121/220**: four PBQs, four feedback and 113 support. 2.5 remains 36/66 support; 2.4 remains 108/199; 2.3 remains 102/162; 2.2 remains 73/134. Completed MCQ slices and inventories do not establish completed phase coverage.',
  'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. No private variant is inferred from local content. Active package remains **1878 records / 435 identities; 489 unresolved mappings; 2954 review decisions; seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All 25 protected release hashes remain unchanged. Thirty-six unsupported local PBQ grammars, protected private review, remaining bank/support coverage and owner decisions remain gates.',
  '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. Scope, canonical concepts/roles/families, independence, difficulty, weights, evidence/calibration and useful teaching still require owner approval. No runtime, private processing, live write, migration, activation, shadow write, cohort, deployment or Phase3 change.',
  '## Validation',
  'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit recomputes exact nineteen/empty deferral, 86-record census, 7 + 38 objective and 258 + 19 bank counts, source provenance, two snapshot replays, 57 correction bindings and nineteen shuffle/remap probes. **'+negativeMutationChecks+' rejected mutations** cover source/trusted substitution, false authored/capture/replay/priority/flags/family, erased qualifications and every inherited precise hold, stale/swapped corrections, corrupt census/counts, unsupported scope/role/weight/evidence/remediation, forbidden payload export, ready-status substitution and activation. Full mapping suite: all 29 tests and deterministic package verification; 25 release hashes unchanged. Task-only **[skip deploy]** commit/push. Live/browser/private content is not checked.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE43_MCQS_NOT_READY',reviewedIds:ids,deferredIds:deferred.map(r=>r.questionId),newDispositions:38,bankProgress,objective43:packet.objective43Denominator,snapshotReplays:2,wrongCorrections:57,shuffleProbes:19,preciseHolds:preciseHolds.filter(Boolean).length,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
