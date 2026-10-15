# Phase 2B-5 — held practice-keyword corrections and Wi-Fi reveal

**Thirteen source-bound offline candidates; all181 holds and current counts preserved.** Baseline:268a4849f92878e86a8ece58e71235950cd5a947. Exactly12 held practice-keyword records across cloud3,data3,OT2,memory3,Wi-Fi1, plus check:wifi-access-defense. Parents, guides and cards are bounded context; no additional child is reviewed or dispositioned. Master plan remains product authority; Phase1 audit supplies historical facts. No unresolved product decision changes behavior here.

## Root causes and precise draft wording

- **IaC**: meaning text ID `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`; full candidate wording is in the appendix.
- **tokenization**: meaning text ID `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`; full candidate wording is in the appendix.
- **ICS**: meaning text ID `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3`; full candidate wording is in the appendix.
- **SCADA**: meaning text ID `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912`; full candidate wording is in the appendix.
- **race condition**: meaning text ID `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`; full candidate wording is in the appendix.
- **WPA3**: meaning text ID `sha256:7ae5f100f57dc25ebe4bac0ebec1cafba0c1f5272b026f1e98972bc84b2fbf15`; full candidate wording is in the appendix.

These shared meanings are used in an in-memory profile copy by the exact existing buildDeepDivePracticeQuestions source. Current labels, keys, IDs, option ordering and objective source strings stay exact for the twelve candidates. The ICS prompt additionally asks for the umbrella category; the SCADA prompt asks for the most specific subtype. This makes the requested granularity explicit rather than claiming the two concepts are mutually exclusive. Those are candidate-only row prompt refinements, not an installed authoring override or canonical relationship.

The IaC, tokenization and race defects appear in every complete option-feedback set for their three-row groups, including rows keyed to another term. Correcting only the keyed clue would leave unsound alternative teaching. All offered definitions are therefore regenerated from the bounded candidate profile. For all twelve rows, the candidate optionFeedback stores the definition body without its redundant term prefix: the actual renderer already supplies that label. Twenty-five current label/definition branches display the prefix twice; all25 candidate branches remove it. Main explanations keep their one term prefix because that paragraph has no separate renderer label.

The current interface calls the alternatives panel “Why the other options do not fit” while showing general term definitions. Clearer definitions are contrasts, not newly authored pair-specific causal explanations or proof of learning. Current and candidate checks remain guided recognition by exact offered-label equality, not trusted grading, independent scenario families, concept mastery or observed recovery. All previous semantic/parent holds remain.

**Same-parent Wi-Fi reveal draft prompt:** A university wants individual Wi-Fi credentials, revocation of future access and termination of active sessions without changing a shared password. What architecture and enforcement steps fit?

**Draft model response:** Use WPA-Enterprise with 802.1X/EAP and a RADIUS-backed identity service for individual accounts. Disable the account or credential for future authentication, and separately terminate established sessions through a supported authenticated disconnect mechanism, such as a RADIUS Disconnect-Request. Verify that enforcement succeeded. Reauthentication, cached authorization and device/server support affect timing; account disablement alone does not guarantee immediate disconnection.

The reveal's question and response both change so architecture/credential disablement is separated from active-session enforcement. The source already renders this same parent's question and gated model response; no new workflow is invented. It remains an ungraded reveal with no attempt, disconnect request, account action or actual network test.

## Exact row and field bindings

Each field below references the deduplicated text pool in the packet and appendix. No answer label/key is exported as a concept mapping. Source-bound current/parent/guide/candidate revisions and the prior hold are separate.

### practice:cloud-containers-automation:practice-keyword-0

Current `sha256:d5a0c031999a72d468be7246fdda77ee85da27d33fc60fa912a18d6f292a973e`; candidate `sha256:3f949df1d0a360c86952bca98f67d57751365c26270e96b642c75cf53097146c`; parent `sha256:b1e201fa95304ff544f8578386273c9158c09efdb9e68bc211552d8535e5c8b0`; guide `sha256:566d5dbacd1e873de9240b67a81907b5545e1bd7831c7573782fea08cd3013d5`.
Prior hold `sha256:2aa8820ceb1491177b36dc8b85044a8293050f978d91397110fc1fdb1e39e24d` in `docs/drafts/phase-2b5-segmentation-cloud-teaching-proposals.json` remains exact. Complete draft `sha256:60783f4705929c8f8dfd42d483dd8a9cc0930dfe58975ddf0b0d950e53095c54`.

- `optionFeedback.secure baseline`: current `sha256:22d7abca01cd5aea27a9424d39309f34741d8e003b774a54239706eae8b941a3` → candidate `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`; replacement text ID `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`.
- `optionFeedback.IaC`: current `sha256:664851ba862bef442fd4320dc1fd6b1657e229a2bdc238320338d3a215d53ff7` → candidate `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`; replacement text ID `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`.
- `optionFeedback.cloud responsibility matrix`: current `sha256:61bb9c45c5a1afcbe59587adc5221a36c3e0c28f3b7203dc9ee449d3a6805a63` → candidate `sha256:0d1f12ed220ad8325bcaa5f0298a6acc9e10af753552cff40f0b99dc7be7cc4e`; replacement text ID `sha256:0d1f12ed220ad8325bcaa5f0298a6acc9e10af753552cff40f0b99dc7be7cc4e`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:cloud-containers-automation:practice-keyword-1

Current `sha256:e94ef3c2a56f73302003b3f5efbe876db6de8f9e93b403a8534ff820accea252`; candidate `sha256:6680dbf7dcfb26e837f1b184db5dc7e27b59e9141c93ec145824b29aa247967f`; parent `sha256:b1e201fa95304ff544f8578386273c9158c09efdb9e68bc211552d8535e5c8b0`; guide `sha256:566d5dbacd1e873de9240b67a81907b5545e1bd7831c7573782fea08cd3013d5`.
Prior hold `sha256:61f84ebb44714eb91ef3bb0ff5408defb3601aaa62fa11235d2e24d4eef84a71` in `docs/drafts/phase-2b5-segmentation-cloud-teaching-proposals.json` remains exact. Complete draft `sha256:1be28868d0a7c071dee5f02f953bbb4d65ecf63df9668fd96b57e5072e642712`.

- `clue`: current `sha256:50c98c300a9bcd36fb0a76a08a811e41d6f8a08ea5011d7990f6154de5ab40e3` → candidate `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`; replacement text ID `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`.
- `explanation`: current `sha256:664851ba862bef442fd4320dc1fd6b1657e229a2bdc238320338d3a215d53ff7` → candidate `sha256:0f5631cedcf9215ddb4794e4b9747691acd9fa0453964c9fdf9bf930af5430f3`; replacement text ID `sha256:0f5631cedcf9215ddb4794e4b9747691acd9fa0453964c9fdf9bf930af5430f3`.
- `optionFeedback.secure baseline`: current `sha256:22d7abca01cd5aea27a9424d39309f34741d8e003b774a54239706eae8b941a3` → candidate `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`; replacement text ID `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`.
- `optionFeedback.IaC`: current `sha256:664851ba862bef442fd4320dc1fd6b1657e229a2bdc238320338d3a215d53ff7` → candidate `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`; replacement text ID `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`.
- `optionFeedback.cloud responsibility matrix`: current `sha256:61bb9c45c5a1afcbe59587adc5221a36c3e0c28f3b7203dc9ee449d3a6805a63` → candidate `sha256:0d1f12ed220ad8325bcaa5f0298a6acc9e10af753552cff40f0b99dc7be7cc4e`; replacement text ID `sha256:0d1f12ed220ad8325bcaa5f0298a6acc9e10af753552cff40f0b99dc7be7cc4e`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:cloud-containers-automation:practice-keyword-2

Current `sha256:4798677507934ef6788b5db25737269bf9823f29329b6cf2c3bd3c89157aa177`; candidate `sha256:f27ff2f0602b87d6c7c641f0bb8b6edcaf23064c5b952513f58d5f79b3039eb9`; parent `sha256:b1e201fa95304ff544f8578386273c9158c09efdb9e68bc211552d8535e5c8b0`; guide `sha256:566d5dbacd1e873de9240b67a81907b5545e1bd7831c7573782fea08cd3013d5`.
Prior hold `sha256:775ea10bc8fddf98f5603e23dd7adef30c915c3b26a23a3aabc6dfcfbeafa74b` in `docs/drafts/phase-2b5-segmentation-cloud-teaching-proposals.json` remains exact. Complete draft `sha256:a304a07cb369fc54ca80f81c8852584463c31d2987bbcdce9070bbce35726617`.

- `optionFeedback.secure baseline`: current `sha256:22d7abca01cd5aea27a9424d39309f34741d8e003b774a54239706eae8b941a3` → candidate `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`; replacement text ID `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`.
- `optionFeedback.IaC`: current `sha256:664851ba862bef442fd4320dc1fd6b1657e229a2bdc238320338d3a215d53ff7` → candidate `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`; replacement text ID `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c`.
- `optionFeedback.cloud responsibility matrix`: current `sha256:61bb9c45c5a1afcbe59587adc5221a36c3e0c28f3b7203dc9ee449d3a6805a63` → candidate `sha256:0d1f12ed220ad8325bcaa5f0298a6acc9e10af753552cff40f0b99dc7be7cc4e`; replacement text ID `sha256:0d1f12ed220ad8325bcaa5f0298a6acc9e10af753552cff40f0b99dc7be7cc4e`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:data-classification-lifecycle:practice-keyword-0

Current `sha256:ba2c9737dafd1ae870e4e1c389d776783e51efac9897d6bdca85f83acadc905c`; candidate `sha256:a89a0afad1f9f0a09785780ebfd3e35c4315de1379c7fefbd3d4e886e0490aee`; parent `sha256:abbc002f1c6ee5f90c19c3bf1a6437118a2782e2b55649a98e20ee5a180edcf1`; guide `sha256:c6b5a15f3577cb4d12741881c05ca50a8155b26527cd5484714a04d97cfe141d`.
Prior hold `sha256:630652c8ca9c61cc7ca8a784c786c273219e4685a3ed9b92c0662f91ee4c3d1c` in `docs/drafts/phase-2b5-data-classification-privacy-proposals.json` remains exact. Complete draft `sha256:f540ba4e12f326d991ff83275d5901fd021df683e02c08889c64fb9a591b2ad9`.

- `optionFeedback.tokenization`: current `sha256:d56f29e657d32f70b2eff4b127312fd69ecb2ee8f5385e6eac3b007ae28b65c9` → candidate `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`; replacement text ID `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`.
- `optionFeedback.DLP`: current `sha256:a7aec66165aadf67778c6df120ecdb8ef0c66476d47d0c27b74546ed619cac8e` → candidate `sha256:9112d89b927fb7d712d09b86855b078d4345821ff396e78df03e6167357733b4`; replacement text ID `sha256:9112d89b927fb7d712d09b86855b078d4345821ff396e78df03e6167357733b4`.
- `optionFeedback.data classification`: current `sha256:5468df24d8636ea84f679f138b8a66e5b418b141f8dac035e826b49ca7122d31` → candidate `sha256:8a852e629b46ce4a9c541423875471d0a29b08b05608e357139e5bfad05d972d`; replacement text ID `sha256:8a852e629b46ce4a9c541423875471d0a29b08b05608e357139e5bfad05d972d`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:data-classification-lifecycle:practice-keyword-1

Current `sha256:0df39750eb6e5cfcdc0958c2b0318232e3d880252ba33440ab967070c0314630`; candidate `sha256:8b40fdded2f7d446f99ff63b83fab9f60498cf7b223afd2569fa263c0029f649`; parent `sha256:abbc002f1c6ee5f90c19c3bf1a6437118a2782e2b55649a98e20ee5a180edcf1`; guide `sha256:c6b5a15f3577cb4d12741881c05ca50a8155b26527cd5484714a04d97cfe141d`.
Prior hold `sha256:581d500c8009ec126a3f723c8cd073acbd0cad64a7ae42a38f51d4459bd2cd73` in `docs/drafts/phase-2b5-data-classification-privacy-proposals.json` remains exact. Complete draft `sha256:d189e0f8f9e695e673fc9b3645419ea4143f387563eba4fa697350adfceb3280`.

- `optionFeedback.tokenization`: current `sha256:d56f29e657d32f70b2eff4b127312fd69ecb2ee8f5385e6eac3b007ae28b65c9` → candidate `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`; replacement text ID `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`.
- `optionFeedback.DLP`: current `sha256:a7aec66165aadf67778c6df120ecdb8ef0c66476d47d0c27b74546ed619cac8e` → candidate `sha256:9112d89b927fb7d712d09b86855b078d4345821ff396e78df03e6167357733b4`; replacement text ID `sha256:9112d89b927fb7d712d09b86855b078d4345821ff396e78df03e6167357733b4`.
- `optionFeedback.data classification`: current `sha256:5468df24d8636ea84f679f138b8a66e5b418b141f8dac035e826b49ca7122d31` → candidate `sha256:8a852e629b46ce4a9c541423875471d0a29b08b05608e357139e5bfad05d972d`; replacement text ID `sha256:8a852e629b46ce4a9c541423875471d0a29b08b05608e357139e5bfad05d972d`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:data-classification-lifecycle:practice-keyword-2

Current `sha256:8697f4af265d53d0831f183a7e327a168d66cc963ad536c330aa36f1f0b32197`; candidate `sha256:b14ea46085a21475bdabbeb4a36ab52ccc6006890a32fcafd2b7dd11332e31cf`; parent `sha256:abbc002f1c6ee5f90c19c3bf1a6437118a2782e2b55649a98e20ee5a180edcf1`; guide `sha256:c6b5a15f3577cb4d12741881c05ca50a8155b26527cd5484714a04d97cfe141d`.
Prior hold `sha256:fb6309e34e6e485aab63f71b01124586a05789efb706dc1d8e4a2edd6759d0f5` in `docs/drafts/phase-2b5-data-classification-privacy-proposals.json` remains exact. Complete draft `sha256:6fd66ac987102a9b447d75d302b340de6c4d67522de366abde61992dddca7834`.

- `clue`: current `sha256:922ef826f35366528f72ba8e702e399badabdc9b357a44d0f292e616f66947fb` → candidate `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`; replacement text ID `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`.
- `explanation`: current `sha256:d56f29e657d32f70b2eff4b127312fd69ecb2ee8f5385e6eac3b007ae28b65c9` → candidate `sha256:08b0941519adaa2656fecb7a5ca03415e5d8d6c6ef2a02aa09cf02eae65ed256`; replacement text ID `sha256:08b0941519adaa2656fecb7a5ca03415e5d8d6c6ef2a02aa09cf02eae65ed256`.
- `optionFeedback.tokenization`: current `sha256:d56f29e657d32f70b2eff4b127312fd69ecb2ee8f5385e6eac3b007ae28b65c9` → candidate `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`; replacement text ID `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68`.
- `optionFeedback.DLP`: current `sha256:a7aec66165aadf67778c6df120ecdb8ef0c66476d47d0c27b74546ed619cac8e` → candidate `sha256:9112d89b927fb7d712d09b86855b078d4345821ff396e78df03e6167357733b4`; replacement text ID `sha256:9112d89b927fb7d712d09b86855b078d4345821ff396e78df03e6167357733b4`.
- `optionFeedback.data classification`: current `sha256:5468df24d8636ea84f679f138b8a66e5b418b141f8dac035e826b49ca7122d31` → candidate `sha256:8a852e629b46ce4a9c541423875471d0a29b08b05608e357139e5bfad05d972d`; replacement text ID `sha256:8a852e629b46ce4a9c541423875471d0a29b08b05608e357139e5bfad05d972d`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:ot-iot-cyber-physical:practice-keyword-0

Current `sha256:6659ae1fa2fd8eaccb4e170c69ade335c99b2cc91b0d6c0ded9217250b7074db`; candidate `sha256:5149f2540b6f80f62a5da6c95a26c07cf4bcf54ae0a8bbad52a95fa654fdfd26`; parent `sha256:07d79b711e79829144558c7fa58938de0048aa127265a5101f631c73d224298e`; guide `sha256:4eda175584b6189dc4b8b2be6732132d8c92bba069d42ed94b4470d4e22003fc`.
Prior hold `sha256:81286f43d67459970e2c0477b821e9b5588de8cacf2eccbcb158e7d1ca95e71e` in `docs/drafts/phase-2b5-objective41-identity-ot-lessons-proposals.json` remains exact. Complete draft `sha256:df891d104a933a200bb0a07b22ed8deb95c9faaa5f2c87eea3bef5efb1c3cd91`.

- `prompt`: current `sha256:c741c1f40365abb23d88983065bed2fed0e90529d89118a3f72b9bbf071c3c31` → candidate `sha256:566096523a12f9eb6020c3d56608c63fda8d7b53e0541df232ee0d3aa0692191`; replacement text ID `sha256:566096523a12f9eb6020c3d56608c63fda8d7b53e0541df232ee0d3aa0692191`.
- `clue`: current `sha256:c0c6b3d2a10bd0b344d6c9378b54f0ac4e824842bdf77ebf584aebfff3a1db29` → candidate `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3`; replacement text ID `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3`.
- `explanation`: current `sha256:66225831e57a633fe4d851bc2f68b7dca84d41ccb279c8447c69af3b8ba5a9cf` → candidate `sha256:9b3b33589c58809d044407f1404e81e1e84480affe62ccf636b07bac2b7f869d`; replacement text ID `sha256:9b3b33589c58809d044407f1404e81e1e84480affe62ccf636b07bac2b7f869d`.
- `optionFeedback.secure baseline`: current `sha256:22d7abca01cd5aea27a9424d39309f34741d8e003b774a54239706eae8b941a3` → candidate `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`; replacement text ID `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`.
- `optionFeedback.SCADA`: current `sha256:f0c7f8c028fd8e7e8eb1874b48051800b7da52c0a261778c3e5b3c7f3d38cc2e` → candidate `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912`; replacement text ID `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912`.
- `optionFeedback.ICS`: current `sha256:66225831e57a633fe4d851bc2f68b7dca84d41ccb279c8447c69af3b8ba5a9cf` → candidate `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3`; replacement text ID `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:ot-iot-cyber-physical:practice-keyword-1

Current `sha256:f8f4307b2713c13a19680baab84fdd2a3da0fc6ac62ccd79f635cbae66446a9e`; candidate `sha256:4901cc8f4c497959b9ae1200ae4af2210dafccdb402a1d8b92faef0b1331a3d1`; parent `sha256:07d79b711e79829144558c7fa58938de0048aa127265a5101f631c73d224298e`; guide `sha256:4eda175584b6189dc4b8b2be6732132d8c92bba069d42ed94b4470d4e22003fc`.
Prior hold `sha256:f11568b45956d697ebe8329f7701682ab0bb876892134f498e23bda607368133` in `docs/drafts/phase-2b5-objective41-identity-ot-lessons-proposals.json` remains exact. Complete draft `sha256:640e2cdc0b2a95ced2f767d742a88d0f02455f292591d5b2fe2c97a26f1a9d54`.

- `prompt`: current `sha256:c741c1f40365abb23d88983065bed2fed0e90529d89118a3f72b9bbf071c3c31` → candidate `sha256:7ad366962e9e015c08404d27548b389b5667d3c675d7c3886754e1093e4f050c`; replacement text ID `sha256:7ad366962e9e015c08404d27548b389b5667d3c675d7c3886754e1093e4f050c`.
- `clue`: current `sha256:e50b08c1309bb329274bdef233cef3858a9264da4e83efb9ab3dfdf1628faa2c` → candidate `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912`; replacement text ID `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912`.
- `explanation`: current `sha256:f0c7f8c028fd8e7e8eb1874b48051800b7da52c0a261778c3e5b3c7f3d38cc2e` → candidate `sha256:baea768ffc2c29a523f4da9dbe7fcf1c9951da3eb17099c3e06c9c38e6884cdb`; replacement text ID `sha256:baea768ffc2c29a523f4da9dbe7fcf1c9951da3eb17099c3e06c9c38e6884cdb`.
- `optionFeedback.secure baseline`: current `sha256:22d7abca01cd5aea27a9424d39309f34741d8e003b774a54239706eae8b941a3` → candidate `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`; replacement text ID `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350`.
- `optionFeedback.SCADA`: current `sha256:f0c7f8c028fd8e7e8eb1874b48051800b7da52c0a261778c3e5b3c7f3d38cc2e` → candidate `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912`; replacement text ID `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912`.
- `optionFeedback.ICS`: current `sha256:66225831e57a633fe4d851bc2f68b7dca84d41ccb279c8447c69af3b8ba5a9cf` → candidate `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3`; replacement text ID `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:software-memory-concurrency:practice-keyword-0

Current `sha256:6708c71a4a95ac766cab4223041830470b1e9f95c27f62d80c166e45c91e4a3d`; candidate `sha256:1b5fbe2f80ac1b7473ffbd193fdf23a6b4515d4db761056c6881b65f74d8ddd0`; parent `sha256:70f61bd8b08e8a4f7914e41133bd1375c891c4e0412196456658117a56cfc4ed`; guide `sha256:3c3739fa1b50f826e27ca6c0bd7ec76b44fbddaea214671aa7b8d9dd98a88c1f`.
Prior hold `sha256:cd6469839a5cd5c43dda39caf59d0c0c2a3e1707dac9f31120ce28a088554088` in `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` remains exact. Complete draft `sha256:c6f56bbce511d750f26a04b09d368c27c9c08dc00db33bd96e4119bc4e0ff4c7`.

- `optionFeedback.hardening`: current `sha256:ab56bc810ec0185d35cd5688a92fae2429851785dc509d83081481b444966e40` → candidate `sha256:b910addc68c5485f693893712c21c7bc4c6a8906146bcbc19dcd372257fb03c2`; replacement text ID `sha256:b910addc68c5485f693893712c21c7bc4c6a8906146bcbc19dcd372257fb03c2`.
- `optionFeedback.race condition`: current `sha256:d0fa55f40604d865c48d950321f9f082da1c48dac04904ca4408306cd2138f35` → candidate `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`; replacement text ID `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`.
- `optionFeedback.buffer overflow`: current `sha256:08f06bcd520c070fad6b778127f87b14ca2380d4c20e73612f20e7b3f5b9c284` → candidate `sha256:0e82cca1f63ad0f25fb4851039fab3d35da00a37479e3fe086f7a8d6af5c3961`; replacement text ID `sha256:0e82cca1f63ad0f25fb4851039fab3d35da00a37479e3fe086f7a8d6af5c3961`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:software-memory-concurrency:practice-keyword-1

Current `sha256:9a2537c9410592c57b13d5455621785e53fcead2a9b6d0e81617e5eb86a88b1a`; candidate `sha256:36a1e59f04bb31d45b1ca48ff402c014052e4076edc0cb2ca33c33627ee62d5d`; parent `sha256:70f61bd8b08e8a4f7914e41133bd1375c891c4e0412196456658117a56cfc4ed`; guide `sha256:3c3739fa1b50f826e27ca6c0bd7ec76b44fbddaea214671aa7b8d9dd98a88c1f`.
Prior hold `sha256:2b837f378f03300d447d4d4f0284df7a437d0c76e23b7531bfe4391de9d63ea0` in `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` remains exact. Complete draft `sha256:5290b082870da7acc0a3f22c13028061476b1f26e4a36168dab0367685d2e439`.

- `clue`: current `sha256:891533597db569303ff76ac395ebd2b7a63e46e84ded1f09b8d430b7fe0b4b8b` → candidate `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`; replacement text ID `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`.
- `explanation`: current `sha256:d0fa55f40604d865c48d950321f9f082da1c48dac04904ca4408306cd2138f35` → candidate `sha256:65024a52e810fe26f905c90f678e09554076dce8b71d3b56719d8324bdaeded0`; replacement text ID `sha256:65024a52e810fe26f905c90f678e09554076dce8b71d3b56719d8324bdaeded0`.
- `optionFeedback.hardening`: current `sha256:ab56bc810ec0185d35cd5688a92fae2429851785dc509d83081481b444966e40` → candidate `sha256:b910addc68c5485f693893712c21c7bc4c6a8906146bcbc19dcd372257fb03c2`; replacement text ID `sha256:b910addc68c5485f693893712c21c7bc4c6a8906146bcbc19dcd372257fb03c2`.
- `optionFeedback.race condition`: current `sha256:d0fa55f40604d865c48d950321f9f082da1c48dac04904ca4408306cd2138f35` → candidate `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`; replacement text ID `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`.
- `optionFeedback.buffer overflow`: current `sha256:08f06bcd520c070fad6b778127f87b14ca2380d4c20e73612f20e7b3f5b9c284` → candidate `sha256:0e82cca1f63ad0f25fb4851039fab3d35da00a37479e3fe086f7a8d6af5c3961`; replacement text ID `sha256:0e82cca1f63ad0f25fb4851039fab3d35da00a37479e3fe086f7a8d6af5c3961`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:software-memory-concurrency:practice-keyword-2

Current `sha256:569f075b6dc2a5625f9cc145468d44f584641c47a8bcf3b38eb5e03896acd1e5`; candidate `sha256:1d4db0e80989151c9ad04184254d6feb3d1e14da934441120431497ff912f456`; parent `sha256:70f61bd8b08e8a4f7914e41133bd1375c891c4e0412196456658117a56cfc4ed`; guide `sha256:3c3739fa1b50f826e27ca6c0bd7ec76b44fbddaea214671aa7b8d9dd98a88c1f`.
Prior hold `sha256:24f326a2677f66eeb35a47307e2eb27f925c93d177cb6e671ddb3c7bfab89e6f` in `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` remains exact. Complete draft `sha256:992397171d9e68c434f8cd3c1f6b6f7c98aeab7a46591c59398d458024db39b6`.

- `optionFeedback.hardening`: current `sha256:ab56bc810ec0185d35cd5688a92fae2429851785dc509d83081481b444966e40` → candidate `sha256:b910addc68c5485f693893712c21c7bc4c6a8906146bcbc19dcd372257fb03c2`; replacement text ID `sha256:b910addc68c5485f693893712c21c7bc4c6a8906146bcbc19dcd372257fb03c2`.
- `optionFeedback.race condition`: current `sha256:d0fa55f40604d865c48d950321f9f082da1c48dac04904ca4408306cd2138f35` → candidate `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`; replacement text ID `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36`.
- `optionFeedback.buffer overflow`: current `sha256:08f06bcd520c070fad6b778127f87b14ca2380d4c20e73612f20e7b3f5b9c284` → candidate `sha256:0e82cca1f63ad0f25fb4851039fab3d35da00a37479e3fe086f7a8d6af5c3961`; replacement text ID `sha256:0e82cca1f63ad0f25fb4851039fab3d35da00a37479e3fe086f7a8d6af5c3961`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### practice:wifi-access-defense:practice-keyword-0

Current `sha256:60e7974cdfb93f1e0930a9cc1d72d80abe2030e75c336e2a0e4a093a9510e0fc`; candidate `sha256:adaf72350ecb2fb7dfbc03d7e26fa8a30a9d63454ee0063dd4c41e8be1005592`; parent `sha256:191e7420490f5dbde85740275288773c4803a768cdc8eaa1ddf6b2e4a3ead81e`; guide `sha256:3ac0a2c60c87697033241501643df3f2bff033c2ab0db8bac066748ee55e0460`.
Prior hold `sha256:f38b03b1d9235536e726203b3cd3b43209eeb0b89dd42843f74efd00db6b0b25` in `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` remains exact. Complete draft `sha256:3929f798b271a8c7aeb2615d2f1716011ee2ed729f2a3556c6eb645419162a54`.

- `clue`: current `sha256:a4ddc8f7af79658eba338aec719ae720f03228cd6ae94a6c79af8f0573488a4d` → candidate `sha256:7ae5f100f57dc25ebe4bac0ebec1cafba0c1f5272b026f1e98972bc84b2fbf15`; replacement text ID `sha256:7ae5f100f57dc25ebe4bac0ebec1cafba0c1f5272b026f1e98972bc84b2fbf15`.
- `explanation`: current `sha256:6b6340995a3fc150879e36053ac25e8fc94f3b9ecbd2e3e5137591e89ae7439f` → candidate `sha256:385c97a9c3971ed212f8f8e50f3d990faf5ab25d09c1898a93399190428e0420`; replacement text ID `sha256:385c97a9c3971ed212f8f8e50f3d990faf5ab25d09c1898a93399190428e0420`.
- `optionFeedback.RADIUS`: current `sha256:eeb8cb8de717bfc1fa8eefb76bacae3ec919c25dd4b3ab09a3569b9b8661e20e` → candidate `sha256:c8029ccb8f4fb1c72801a3fb67d22e0db6919947a2c543b51d2fa0c3134b244b`; replacement text ID `sha256:c8029ccb8f4fb1c72801a3fb67d22e0db6919947a2c543b51d2fa0c3134b244b`.
- `optionFeedback.CCMP`: current `sha256:6e1021201740ace6bf2fc348ef2f0534ec20b8332dd554a99cf2779119a62c15` → candidate `sha256:35e56b0d60171bf8e490e604ccb5e1114a4be7fb63f9606bec92c052e5be24c1`; replacement text ID `sha256:35e56b0d60171bf8e490e604ccb5e1114a4be7fb63f9606bec92c052e5be24c1`.
- `optionFeedback.802.1X`: current `sha256:db605160e1e3b00f300af3f51be8fef1b02c59cc159b189079d04d9d4cef6217` → candidate `sha256:9e24f1afaf54ac8d7783d0d31c93fdfa1f092f3e2b517c1e673d0eb9e1038a6a`; replacement text ID `sha256:9e24f1afaf54ac8d7783d0d31c93fdfa1f092f3e2b517c1e673d0eb9e1038a6a`.
- `optionFeedback.WPA3`: current `sha256:6b6340995a3fc150879e36053ac25e8fc94f3b9ecbd2e3e5137591e89ae7439f` → candidate `sha256:7ae5f100f57dc25ebe4bac0ebec1cafba0c1f5272b026f1e98972bc84b2fbf15`; replacement text ID `sha256:7ae5f100f57dc25ebe4bac0ebec1cafba0c1f5272b026f1e98972bc84b2fbf15`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.

### check:wifi-access-defense

Current `sha256:7310b27b39b388cfc10bcdc6335c77f3b2739a568e12e58107d64bf85ab6e6bb`; candidate `sha256:055f5f97750d11eb2fe38e2e8ca9130e0163eb7eb0f93cb2a0cc7db1135f3c0a`; parent `sha256:191e7420490f5dbde85740275288773c4803a768cdc8eaa1ddf6b2e4a3ead81e`; guide `sha256:3ac0a2c60c87697033241501643df3f2bff033c2ab0db8bac066748ee55e0460`.
Prior hold `sha256:d235dc81400cbe63df7081e5e60863cc0e17295cddce9c84626ae9831c09ad37` in `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` remains exact. Complete draft `sha256:335b4a02626de38899f4dcf338b4b64c841a235857673d95f7016be941575dec`.

- `check.question`: current `sha256:ff3151026fe7a59d59e06d9f0c07390d5c38c3879c6961574cf22860dafdbef4` → candidate `sha256:2965fa5cc60f04e5046bfed1fe724aa8fbd360bdb445904ac36e0b38c6eb405f`; replacement text ID `sha256:2965fa5cc60f04e5046bfed1fe724aa8fbd360bdb445904ac36e0b38c6eb405f`.
- `check.answer`: current `sha256:2501e864d08f7ccc391fdb7878524c084b51fd1f1f39b5192c500f72b7715784` → candidate `sha256:9c69420ad717bc52d87536715a598a40d7e46f4496d977506151c918eb926aa6`; replacement text ID `sha256:9c69420ad717bc52d87536715a598a40d7e46f4496d977506151c918eb926aa6`.

The cluster boundary and exact prior hold remain; current-source credit and hold resolution stay0.


## Primary references and scope

- [iac](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code) — Unversioned HashiCorp tutorial read2026-10-16; Configuration-file definition, workflow and collaboration. Files/versioning can support review; review/security are not automatic. Product claims of safe deployment are not a guarantee.
- [tokenization](https://listings.pcisecuritystandards.org/documents/Tokenization_Product_Security_Guidelines.pdf) — PCI SSC Tokenization Product Security Guidelines v1.0, April2015; Printed pages5-8: terminology, taxonomy, reversibility and mapping. PAN substitution/recovery and customer/account linkage counterexamples only; generic privacy wording is a bounded inference, not PCI compliance or legal anonymization.
- [ot](https://csrc.nist.gov/glossary/term/industrial_control_system) — NIST CSRC entry citing SP800-82r3; read2026-10-16; ICS definitions including SCADA and distributed/local systems. Umbrella/subtype and distributed-site terminology; no assertion that all industrial control is SCADA or categories are exclusive.
- [race](https://cwe.mitre.org/data/definitions/362.html) — CWE-362, page identifies CWE4.20; read2026-10-16; Description. Concurrent access, shared resources and interference; no code, exploit, race timing or current application tested.
- [wifi](https://arubanetworking.hpe.com/techdocs/aos/wifi-design-deploy/security/modes/wpa3-personal/) — HPE Aruba AOS10 TechDocs, unversioned page read2026-10-16; Protocol: SAE versus WPA2-Personal PSK. Personal authentication distinction only; no universal PMF/cipher/transition-mode or deployment-security guarantee. Wi-Fi Alliance page unavailable.
- [disconnect](https://www.rfc-editor.org/rfc/rfc5176) — RFC5176, January2008; 2.1,3 and security considerations. Separate Disconnect-Request ACK/NAK, session identification and authorized source; no guarantee of support, success or immediate termination.

Only the stated sections were examined. The PCI PDF was securely retrieved from the primary listings host after web text-section retrieval failed, then read with the bundled PDF reader; reviewed bytes `c08663de804d159950ae0e2f80fde47c18ff715ed369e02b06e11ad8b3adbb5b`. Its taxonomy and account-linkage counterexample defeat a universal no-meaning/anonymity claim; this is not a PCI scope determination. The Wi-Fi Alliance page was unavailable; the exact SAE/PSK distinction uses vendor primary technical documentation. No current certification or algorithm-policy audit is claimed. RFC5176 may fail/NAK and requires authorized session targeting; an architecture label cannot prove immediate termination.

Prior lesson, guide and card packets supply the existing bounded definitions and parent delivery observations. They do not approve these changed revisions. The broader cloud guide/section holds, tokenization scope, industrial hierarchy, concurrency semantics, and Wi-Fi implementation limits stay explicit.

## Focused proof, rendering and integration limits

- Exact current builder replay matches the imported helper for all five parents;13 current record signatures, five complete parent/profile signatures and five guide signatures are bound. In-memory source parents stay byte-equivalent.
- 53 precise field corrections,13 default-off checks and13 pre-answer/pre-reveal projections pass. Practice before-answer output contains only prompt/clue/offered labels and no key, correction or feedback fields; the literal keyed term is absent from prompt/clue. The model response is absent before reveal. Offered answer labels themselves remain visible choices, as intended.
- All37 offered practice responses are checked:12 correct/25 wrong; with the ungraded reveal there are38 after-answer/reveal views. Exact label matching, all alternative definitions and unchanged option order are asserted.
- Twelve current/candidate static alternatives specimens confirm duplicate prefixes fall25→0. Twelve lexical matcher probes remain case-stable, but the actual practice question/feedback fields are plain React text and do not call GlossaryText. Matcher recognition does not establish tooltip delivery, semantic links or a new concept.
- 240 invalid/stale-parent/profile/private/curated-row/mode/choice/duplicate-option/duplicate-clue/missing-feedback/key-leak/unsafe-markup/non-JSON inputs are rejected. Recomputed draft checksums do not authorize changed text. One independent hostile React text escape probe passes; no getter executes.
- 1026 altered packets are rejected;146 prior packets,752 inherited fields,72 immediate baseline fields,454 source fingerprints and25 protected release files reconcile. Equality guards protect the exact reviewed drafts; they are not an independent general semantic/factuality detector.

No full interactive React page, browser/keyboard/screen-reader, learner handler, account session, network/control or active parent is exercised. A future global source-guide edit would also affect OT practice-keyword-2 and Wi-Fi practice-keyword-1/2, which are outside this13-row review. They receive no candidate disposition here; broader fanout and parent guide/lesson approval require a separate review. No new production schema is installed for the two specificity prompts. **No additional owner choice is required to review this offline draft; no human approval is inferred.**

## Prior, new and remaining

| Measure | Prior | New credit | Combined /total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1694|0|1694/1878|184|
| Support teaching |748|0|748/834|86|
| Glossary definitions |150|0|150/162|12|
| Bank questions |463|0|463/483|20|
| Full bank feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|

Selected13: prior qualified0,new0,remaining13. All181 existing holds remain exact, including these13; zero additions/resolutions. Instructional786 raw/772 distinct/14 repeats, prior PBQ proofs, all source-selection/private/census/ledger/native-v1/v2/specimen boundaries and glossary BPA/SOC owner decisions remain unchanged. No canonical role/objective/concept/teaching-link, human, novelty, family, trusted/mastery/activation credit is added.

Required gates: all29 mapping tests and deterministic package, deterministic packet/report recheck, git diff --check, actual skip-deploy exit0/control1, task-only commit/push with exact remote refs/bytes, empty index and eight unrelated dirty entries preserved. Native npm audit of unchanged packages/lockfile still reports7 existing advisories including1 critical/4 high; no dependency installation/fix or project-wide clearance is claimed.

## Deduplicated candidate field text

- `sha256:49ea7aad69e20c2ec2730db138240d4a6470778fe3c0f3b8aaec726cfbd9a350` — An approved starting configuration that is deployed, checked, and maintained.
- `sha256:3ab7db76e2bf7558d225e00017a9e030c3a459f14c732c83b28617a659341c1c` — Defining and changing infrastructure using machine-readable configuration and automation. Files can be versioned and reviewed, but their existence does not prove review or security.
- `sha256:0d1f12ed220ad8325bcaa5f0298a6acc9e10af753552cff40f0b99dc7be7cc4e` — A split showing which security tasks belong to the provider and which belong to the customer.
- `sha256:0f5631cedcf9215ddb4794e4b9747691acd9fa0453964c9fdf9bf930af5430f3` — IaC: Defining and changing infrastructure using machine-readable configuration and automation. Files can be versioned and reviewed, but their existence does not prove review or security.
- `sha256:880a65358b76f9bad2567d43667a34795c86f5f3939f16d6bab888d3d2fd5a68` — Replacing a sensitive value with a substitute token. Protection depends on token design and access to any mapping or recovery process; substitution alone does not prove anonymity.
- `sha256:9112d89b927fb7d712d09b86855b078d4345821ff396e78df03e6167357733b4` — Data loss prevention detects or controls sensitive-data handling across endpoints, storage and communications according to policy.
- `sha256:8a852e629b46ce4a9c541423875471d0a29b08b05608e357139e5bfad05d972d` — A label that tells people how sensitive data is and how it must be handled.
- `sha256:08b0941519adaa2656fecb7a5ca03415e5d8d6c6ef2a02aa09cf02eae65ed256` — tokenization: Replacing a sensitive value with a substitute token. Protection depends on token design and access to any mapping or recovery process; substitution alone does not prove anonymity.
- `sha256:566096523a12f9eb6020c3d56608c63fda8d7b53e0541df232ee0d3aa0692191` — Which umbrella category is described, rather than one of its subtypes?
- `sha256:f1f7d5eae0586140da55ee90e5c00979f4d1ca7700a7a23b2f62e840db07d5e3` — Umbrella category of systems that monitor or control industrial processes, including supervisory data-acquisition systems and distributed control systems.
- `sha256:9b3b33589c58809d044407f1404e81e1e84480affe62ccf636b07bac2b7f869d` — ICS: Umbrella category of systems that monitor or control industrial processes, including supervisory data-acquisition systems and distributed control systems.
- `sha256:3f9e06d5d6bc968b1f537dab0c2ea708e4619b9cc4e97a827ce58732b99a4912` — Subtype of industrial control system that gathers field data and provides supervisory control, commonly across geographically dispersed sites.
- `sha256:7ad366962e9e015c08404d27548b389b5667d3c675d7c3886754e1093e4f050c` — Which most specific subtype in these choices matches this description?
- `sha256:baea768ffc2c29a523f4da9dbe7fcf1c9951da3eb17099c3e06c9c38e6884cdb` — SCADA: Subtype of industrial control system that gathers field data and provides supervisory control, commonly across geographically dispersed sites.
- `sha256:b910addc68c5485f693893712c21c7bc4c6a8906146bcbc19dcd372257fb03c2` — Reducing risk by securely configuring a system and removing unnecessary features.
- `sha256:7df1116f378af62829e42e6c1a0a210aae7480bca0139faae4538d733900de36` — Concurrent operations access shared state or resources without adequate synchronization, allowing interference and timing to change the result.
- `sha256:0e82cca1f63ad0f25fb4851039fab3d35da00a37479e3fe086f7a8d6af5c3961` — A program writes beyond the memory space that was set aside for data.
- `sha256:65024a52e810fe26f905c90f678e09554076dce8b71d3b56719d8324bdaeded0` — race condition: Concurrent operations access shared state or resources without adequate synchronization, allowing interference and timing to change the result.
- `sha256:7ae5f100f57dc25ebe4bac0ebec1cafba0c1f5272b026f1e98972bc84b2fbf15` — Wi-Fi security generation whose Personal mode uses Simultaneous Authentication of Equals (SAE) for password-based authentication, in place of the WPA2-Personal PSK mechanism.
- `sha256:385c97a9c3971ed212f8f8e50f3d990faf5ab25d09c1898a93399190428e0420` — WPA3: Wi-Fi security generation whose Personal mode uses Simultaneous Authentication of Equals (SAE) for password-based authentication, in place of the WPA2-Personal PSK mechanism.
- `sha256:c8029ccb8f4fb1c72801a3fb67d22e0db6919947a2c543b51d2fa0c3134b244b` — A protocol commonly used for network access authentication, authorization, and accounting.
- `sha256:35e56b0d60171bf8e490e604ccb5e1114a4be7fb63f9606bec92c052e5be24c1` — An AES-based method used to protect Wi-Fi traffic.
- `sha256:9e24f1afaf54ac8d7783d0d31c93fdfa1f092f3e2b517c1e673d0eb9e1038a6a` — A port-based network access control method often used with EAP and RADIUS.
- `sha256:2965fa5cc60f04e5046bfed1fe724aa8fbd360bdb445904ac36e0b38c6eb405f` — A university wants individual Wi-Fi credentials, revocation of future access and termination of active sessions without changing a shared password. What architecture and enforcement steps fit?
- `sha256:9c69420ad717bc52d87536715a598a40d7e46f4496d977506151c918eb926aa6` — Use WPA-Enterprise with 802.1X/EAP and a RADIUS-backed identity service for individual accounts. Disable the account or credential for future authentication, and separately terminate established sessions through a supported authenticated disconnect mechanism, such as a RADIUS Disconnect-Request. Verify that enforcement succeeded. Reauthentication, cached authorization and device/server support affect timing; account disablement alone does not guarantee immediate disconnection.

No active/runtime/protected/shared compiler/helper content, private/database/live/browser, automation, deployment or Phase3 change. **Offline text corrections only; all current-source holds stay unresolved.**
