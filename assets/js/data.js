(function (window) {
  "use strict";

  window.HXZ = window.HXZ || {};

  var helpingBaselineQuestions = [
    {
      id: "q1",
      dimension: "倾听",
      text: "与他人交谈时，我能够先完整听完对方的表达，再组织自己的回应。"
    },
    {
      id: "q2",
      dimension: "内容回应",
      text: "我能够用简洁的话复述对方表达的重点，而不是逐字重复。"
    },
    {
      id: "q3",
      dimension: "情感理解",
      text: "我能够从语气和情境中辨认对方正在经历的主要情绪。"
    },
    {
      id: "q4",
      dimension: "非评判",
      text: "即使不认同对方的选择，我也能避免立即评价、指责或说教。"
    },
    {
      id: "q5",
      dimension: "内容回应",
      text: "回应他人时，我会避免添加对方没有表达过的事实或推断。"
    },
    {
      id: "q6",
      dimension: "情感理解",
      text: "当对方情绪低落时，我能表达理解，而不是急着让对方振作起来。"
    },
    {
      id: "q7",
      dimension: "行动支持",
      text: "在对方需要建议时，我会先确认其目标和意愿，再讨论可行做法。"
    },
    {
      id: "q8",
      dimension: "行动支持",
      text: "我能够把宽泛的建议转化为清晰、具体、可执行的小步骤。"
    }
  ];

  var empathyDepthQuestions = [
    {
      id: "e1",
      dimension: "情绪觉察",
      text: "我能够较快地注意到对方语气或表情中流露出的情绪变化。"
    },
    {
      id: "e2",
      dimension: "情绪觉察",
      text: "当对方情绪发生变化时，我能意识到自己的回应可能受到影响。"
    },
    {
      id: "e3",
      dimension: "情绪觉察",
      text: "我能区分对方此刻的情绪和我自己产生的情绪。"
    },
    {
      id: "e4",
      dimension: "情绪命名",
      text: "我能找到比较准确的词语来描述对方正在经历的情绪。"
    },
    {
      id: "e5",
      dimension: "情绪命名",
      text: "我能分辨相近情绪之间的差别，例如失望、委屈和愤怒。"
    },
    {
      id: "e6",
      dimension: "情绪命名",
      text: "我会用贴近对方表达的词命名情绪，而不是随意使用专业标签。"
    },
    {
      id: "e7",
      dimension: "情境理解",
      text: "我理解情绪常常与具体事件、期待和关系背景有关。"
    },
    {
      id: "e8",
      dimension: "情境理解",
      text: "我会结合当时情境来判断对方情绪的来源，而不是只凭直觉。"
    },
    {
      id: "e9",
      dimension: "情境理解",
      text: "当对方情绪复杂时，我能接受它可能同时包含多种感受。"
    },
    {
      id: "e10",
      dimension: "回应克制",
      text: "回应对方情绪时，我不会急于把它解释成某种心理问题。"
    },
    {
      id: "e11",
      dimension: "回应克制",
      text: "我能避免使用“你肯定是”“你一定是”这类确定性的推断。"
    },
    {
      id: "e12",
      dimension: "回应克制",
      text: "我允许对方保留自己的情绪，而不是立刻要求对方平静下来。"
    }
  ];

  window.HXZ.data = {
    site: {
      name: "华小助",
      fullName: "华小助心理助人技术训练平台",
      version: "2.1.0-static",
      description: "在安全、无压力的模拟场景中练习心理助人技术。"
    },

    navigation: [
      { id: "home", label: "首页", file: "home.html", icon: "⌂" },
      { id: "assessment", label: "自测", file: "assessment.html", icon: "✓" },
      { id: "training", label: "训练", file: "training.html", icon: "✦", main: true },
      { id: "learning", label: "学习", file: "learning.html", icon: "▤" },
      { id: "profile", label: "我的", file: "profile.html", icon: "○" }
    ],

    routes: {
      welcome: "index.html",
      login: "login.html",
      home: "home.html",
      assessment: "assessment.html",
      assessmentSession: "assessment-session.html",
      assessmentResult: "assessment-result.html",
      training: "training.html",
      trainingGuide: "training-guide.html",
      trainingSession: "training-session.html",
      trainingResult: "training-result.html",
      records: "records.html",
      recordDetail: "record-detail.html",
      learning: "learning.html",
      article: "article.html",
      profile: "profile.html",
      profileEdit: "profile-edit.html"
    },

    pageTitles: {
      home: "首页",
      assessment: "自测中心",
      "assessment-session": "能力自测",
      "assessment-result": "自测结果",
      training: "训练中心",
      "training-guide": "技术导学",
      "training-session": "模拟训练",
      "training-result": "训练评价",
      records: "训练记录",
      "record-detail": "记录详情",
      learning: "学习中心",
      article: "学习资料",
      profile: "个人中心",
      "profile-edit": "编辑资料"
    },

    techniques: [
      {
        id: "restatement",
        category: "empathy",
        categoryLabel: "共情",
        name: "重述",
        description: "用自己的语言简洁复述来访者表达的主要事实和意思。",
        icon: "assets/images/legacy/icon_12.png",
        cover: "assets/images/legacy/idx_03.png",
        status: "available",
        duration: 8,
        level: "入门",
        order: 1,
        focus: "准确重述来访者明确表达的主要内容，不加入未经确认的情绪或判断。",
        goals: [
          "准确抓住来访者表达的核心内容",
          "使用简洁、自然、不带评判的语言",
          "不添加来访者没有表达的情绪或结论"
        ],
        badExample: "你一定非常难过，也觉得自己特别失败。",
        goodExample: "你最近投了很多简历，但一直没有收到回应。",
        dimensionLabels: { accuracy: "准确性", concise: "简洁性", neutral: "中立性", natural: "自然度" }
      },
      {
        id: "emotion-reflection",
        category: "empathy",
        categoryLabel: "共情",
        name: "情感反映",
        description: "辨认并回应来访者已经表达或清晰呈现的情绪体验。",
        icon: "assets/images/legacy/icon_13.png",
        cover: "assets/images/legacy/idx_03.png",
        status: "available",
        duration: 10,
        level: "进阶",
        order: 2,
        focus: "辨认来访者已经表达或清晰呈现的情绪，并用贴近的语言回应，不夸大、不推断。",
        goals: [
          "准确辨认来访者当前最主要的情绪",
          "用贴近其表达的语言把情绪说出来",
          "不把自己的推测当作对方的感受"
        ],
        badExample: "你肯定特别崩溃，而且早就受够了。",
        goodExample: "你听起来很失望，也有点不安。",
        dimensionLabels: { accuracy: "情绪识别", concise: "回应贴近", neutral: "非评判", natural: "自然度" }
      },
      {
        id: "empathy-integration",
        category: "empathy",
        categoryLabel: "共情",
        name: "共情综合",
        description: "把事实、情绪与意义组织成完整、贴近来访者的回应。",
        icon: "assets/images/legacy/icon_14.png",
        cover: "assets/images/legacy/idx_03.png",
        status: "available",
        duration: 12,
        level: "进阶",
        order: 3,
        focus: "把来访者表达的事实与情绪整合成一句完整、有分寸的回应。",
        goals: [
          "同时回应事实与情绪",
          "把感受与事件的意义连接起来",
          "保持回应的分寸，不越界解读"
        ],
        badExample: "你之所以这么痛苦，是因为你从小缺乏安全感。",
        goodExample: "你一直很努力地准备，却一直没有回应，这让你感到失望，也开始怀疑自己。",
        dimensionLabels: { accuracy: "信息完整", concise: "整合自然", neutral: "非评判", natural: "自然度" }
      },
      {
        id: "interpretation",
        category: "insight",
        categoryLabel: "领悟",
        name: "解释",
        description: "帮助来访者从新的角度理解行为、感受和关系模式。",
        icon: "assets/images/legacy/idx_04.png",
        cover: "assets/images/legacy/idx_04.png",
        status: "available",
        duration: 12,
        level: "进阶",
        order: 4,
        focus: "基于已有信息提出一个新的理解角度，并用试探性的方式邀请对方一起核对。",
        goals: [
          "基于来访者提供的信息提出理解",
          "使用试探性语言，留下讨论空间",
          "不把解释当作唯一结论"
        ],
        badExample: "你这样做肯定是因为你性格太软弱。",
        goodExample: "听起来，你似乎习惯在冲突里先责怪自己，这会不会让你更难拒绝别人？",
        dimensionLabels: { accuracy: "解释合理性", concise: "证据支撑", neutral: "试探性", natural: "自然度" }
      },
      {
        id: "confrontation",
        category: "insight",
        categoryLabel: "领悟",
        name: "面质",
        description: "温和指出来访者表达中存在的不一致，促进自我觉察。",
        icon: "assets/images/legacy/idx_04.png",
        cover: "assets/images/legacy/idx_04.png",
        status: "available",
        duration: 12,
        level: "进阶",
        order: 5,
        focus: "温和地指出表达中的不一致，帮助来访者觉察，而不是指责。",
        goals: [
          "准确识别表达中的不一致",
          "用温和、非指责的方式指出",
          "把发现交给来访者自己判断"
        ],
        badExample: "你嘴上说想改变，可你根本没行动，这不是自相矛盾吗？",
        goodExample: "你说希望关系更亲近，但又常常主动回避联系，这两者之间似乎有些不一样，你怎么看？",
        dimensionLabels: { accuracy: "不一致识别", concise: "温和度", neutral: "非评判", natural: "自然度" }
      },
      {
        id: "action-plan",
        category: "action",
        categoryLabel: "行动",
        name: "行动计划",
        description: "与来访者共同把目标转化为具体、可执行的小步骤。",
        icon: "assets/images/legacy/idx_05.png",
        cover: "assets/images/legacy/idx_05.png",
        status: "available",
        duration: 10,
        level: "进阶",
        order: 6,
        focus: "与来访者共同确定一个具体、可执行、由对方愿意尝试的下一步。",
        goals: [
          "先确认来访者的目标与意愿",
          "把目标拆成具体可执行的小步骤",
          "让计划由来访者自己选择和决定"
        ],
        badExample: "你就应该每天学习两小时，别想那么多。",
        goodExample: "如果你愿意，我们可以先定一个很小、容易做到的第一步，比如今晚先整理一页复习清单。",
        dimensionLabels: { accuracy: "目标聚焦", concise: "可行性", neutral: "协作性", natural: "自然度" }
      }
    ],

    assessments: [
      {
        id: "helping-baseline",
        name: "助人沟通能力自测",
        description: "快速了解你在倾听、内容回应、情感理解和行动支持方面的当前状态。",
        duration: 3,
        questionCount: 8,
        status: "available",
        icon: "◇",
        recommend: {
          training: "restatement",
          trainingLabel: "重述技术",
          trainingText: "练习准确提取和简洁回应谈话中的主要信息。",
          article: "restatement-basics",
          articleLabel: "重述的三个重点",
          articleText: "先理解常见误区，再进入模拟案例。"
        }
      },
      {
        id: "empathy-depth",
        name: "共情反应深度自测",
        description: "通过情境判断进一步了解你在情绪觉察、命名与回应克制方面的特点。",
        duration: 6,
        questionCount: 12,
        status: "available",
        icon: "◎",
        recommend: {
          training: "emotion-reflection",
          trainingLabel: "情感反映",
          trainingText: "练习辨认并回应来访者已经清晰呈现的情绪。",
          article: "empathy-process",
          articleLabel: "如何形成完整共情",
          articleText: "从听见事实，到理解情绪，再到把意义还给来访者。"
        }
      }
    ],

    assessmentQuestionSets: {
      "helping-baseline": helpingBaselineQuestions,
      "empathy-depth": empathyDepthQuestions
    },

    assessmentQuestions: helpingBaselineQuestions,

    assessmentOptions: [
      { value: 1, label: "完全不符合" },
      { value: 2, label: "比较不符合" },
      { value: 3, label: "一般" },
      { value: 4, label: "比较符合" },
      { value: 5, label: "完全符合" }
    ],

    trainingCases: [
      {
        id: "job-search",
        technique: "restatement",
        title: "求职没有回应",
        speaker: "小林",
        context: "来访者连续一个月投递简历，但没有获得面试机会。",
        message: "我这一个月一直在找工作，投了很多简历，但没有收到一个回应。我每天起床都期待手机里能有面试通知，可每次都很失望。",
        keyFacts: [
          ["找工作", "求职"],
          ["投简历", "简历", "投递"],
          ["没有回应", "没回应", "没有反馈", "没收到", "石沉大海"],
          ["面试通知", "面试", "通知"]
        ],
        avoidWords: ["失败", "没用", "一定", "应该", "别难过"],
        reference: "你这一个月投了很多简历，但一直没有收到面试回应。"
      },
      {
        id: "study-pressure",
        technique: "restatement",
        title: "复习计划被打乱",
        speaker: "小周",
        context: "来访者原本安排了复习计划，但接连出现临时任务。",
        message: "我本来把这周每天要复习什么都安排好了，结果小组作业和临时通知一个接一个，现在计划全乱了，我都不知道该先做哪一件。",
        keyFacts: [
          ["复习计划", "安排", "计划"],
          ["小组作业", "作业"],
          ["临时通知", "临时任务", "任务"],
          ["不知道先做什么", "不知先做", "优先", "先处理"]
        ],
        avoidWords: ["焦虑症", "拖延", "你应该", "别想太多"],
        reference: "你原本安排好的复习计划被接连出现的任务打乱了，现在不知道该先处理什么。"
      },
      {
        id: "friend-distance",
        technique: "restatement",
        title: "朋友逐渐疏远",
        speaker: "小悦",
        context: "来访者发现好友最近回复消息越来越少。",
        message: "我们以前什么都会聊，可她最近经常隔很久才回消息，有时只回一两个字。我想问她是不是发生了什么，又怕自己显得太敏感。",
        keyFacts: [
          ["以前常聊天", "以前", "原来", "常聊", "什么都聊"],
          ["回复变少", "回消息少", "很久才回", "回复越来越少"],
          ["想询问", "想问", "想了解", "想知道"],
          ["担心太敏感", "担心", "怕", "太敏感"]
        ],
        avoidWords: ["她讨厌你", "玻璃心", "直接质问", "肯定"],
        reference: "你发现朋友最近回复越来越少，想了解发生了什么，又担心自己的询问显得太敏感。"
      },
      {
        id: "exam-anxiety",
        technique: "emotion-reflection",
        title: "考试前的紧张",
        speaker: "小佳",
        context: "来访者即将参加重要考试，出现明显紧张。",
        message: "离考试越近我就越紧张，晚上会翻来覆去睡不着，白天也一直想着考不好怎么办，心一直悬着。",
        keyFacts: [
          ["紧张", "紧绷"],
          ["睡不着", "失眠", "睡不好"],
          ["担心考不好", "怕考不好", "考砸"],
          ["心悬着", "不安"]
        ],
        avoidWords: ["焦虑症", "你太脆弱", "别紧张", "不要怕", "肯定能考好"],
        reference: "你听起来非常紧张，心里一直悬着，也担心自己考不好。"
      },
      {
        id: "family-conflict",
        technique: "emotion-reflection",
        title: "与家人的争执",
        speaker: "小程",
        context: "来访者与家人发生争执后感到委屈。",
        message: "我明明已经很努力在解释我的想法了，可他们根本听不进去，还一直否定我。我气得不行，又觉得很委屈。",
        keyFacts: [
          ["生气", "气得", "气"],
          ["委屈"],
          ["不被理解", "听不进去", "否定"]
        ],
        avoidWords: ["你太敏感", "别计较", "父母都是为你好", "你应该理解"],
        reference: "你感到既生气又委屈，因为自己努力解释却始终没有被理解。"
      },
      {
        id: "internship-setback",
        technique: "empathy-integration",
        title: "实习申请受挫",
        speaker: "小宇",
        context: "来访者接连申请实习岗位未获录用。",
        message: "我准备了好久，简历也改了很多遍，面试的时候觉得自己表现还行，可最后还是没被录用。我开始怀疑自己是不是根本不适合这个方向。",
        keyFacts: [
          ["准备", "努力", "改简历"],
          ["面试"],
          ["没被录用", "没通过", "被拒"],
          ["怀疑自己", "不适合"]
        ],
        avoidWords: ["你能力不行", "别怀疑", "想开点", "下次一定行"],
        reference: "你认真准备并努力争取了很久，却仍然没有被录用，这让你开始怀疑自己是否适合这个方向。"
      },
      {
        id: "friend-betrayal",
        technique: "empathy-integration",
        title: "被朋友误会",
        speaker: "小晴",
        context: "来访者被好友误会，感到失望。",
        message: "我一直很在意这段关系，什么事都愿意跟她说，结果她因为一件小事就误会我，还在别人面前说我的不是。我很失望，又觉得这段关系好像没那么值得了。",
        keyFacts: [
          ["在意", "重视", "珍惜"],
          ["误会"],
          ["失望"],
          ["没那么值得", "不值得"]
        ],
        avoidWords: ["她不是故意的", "你想多了", "别在意", "别放在心上"],
        reference: "你一直很看重这段关系，却因为这次误会感到失望，也开始重新衡量它在你心里的分量。"
      },
      {
        id: "over-apologize",
        technique: "interpretation",
        title: "习惯性道歉",
        speaker: "小安",
        context: "来访者发现自己遇到冲突时总是先道歉。",
        message: "每次跟别人有分歧，不管是不是我的错，我都会先道歉。好像只有我先退一步，关系才不会出问题。可事后我又觉得自己特别窝囊。",
        keyFacts: [
          ["先道歉", "先退一步"],
          ["不是我的错", "不是自己的错"],
          ["关系不出问题", "怕关系破裂"],
          ["窝囊", "委屈"]
        ],
        avoidWords: ["你太软弱", "你没骨气", "讨好型人格", "你肯定缺爱"],
        reference: "听起来，你似乎把道歉当成维持关系的方式，也许在你的经验里，先退一步是避免冲突、保护关系的一种办法，是这样吗？"
      },
      {
        id: "avoid-decision",
        technique: "interpretation",
        title: "难以做决定",
        speaker: "小然",
        context: "来访者在重要选择上反复犹豫。",
        message: "每次遇到重要的选择，我都会问很多人的意见，可大家说的都不一样，我反而更乱了。我怕选错，怕以后会后悔，所以一直拖着不敢决定。",
        keyFacts: [
          ["问很多人意见", "问意见"],
          ["怕选错", "怕后悔"],
          ["拖着", "不敢决定", "犹豫"]
        ],
        avoidWords: ["优柔寡断", "不够独立", "没主见"],
        reference: "你似乎很希望找到一个绝对不会错的答案，所以会反复征求别人意见，而一旦得不到确定答案，就更难做出选择。会不会是“不能选错”这个要求，让你卡住了？"
      },
      {
        id: "want-rest-but-stay-up",
        technique: "confrontation",
        title: "想休息却熬夜",
        speaker: "小周",
        context: "来访者表示很累想休息，但仍在熬夜。",
        message: "我最近总说太累了要早点睡，可一到晚上就忍不住刷手机，一刷就到凌晨。第二天又很后悔，但到了晚上还是老样子。",
        keyFacts: [
          ["想早睡", "想休息", "累"],
          ["刷手机", "熬夜", "凌晨"],
          ["后悔"],
          ["老样子", "还是这样"]
        ],
        avoidWords: ["自制力太差", "你根本没想改", "说话不算话", "别找借口"],
        reference: "你说自己很想早点休息，但晚上又会一直刷手机到很晚，这两件事好像同时都在发生，你怎么看这个矛盾？"
      },
      {
        id: "want-close-but-avoid",
        technique: "confrontation",
        title: "渴望亲近却回避",
        speaker: "小岚",
        context: "来访者希望与人亲近，却总是回避聚会。",
        message: "我很希望自己能有更亲密的朋友，可每次别人约我出去，我都会找理由推掉。一个人的时候觉得孤单，可真要出去了又觉得很累、很麻烦。",
        keyFacts: [
          ["希望亲密", "想有朋友"],
          ["推掉", "找理由", "回避"],
          ["孤单"],
          ["累", "麻烦"]
        ],
        avoidWords: ["你太矛盾", "社恐", "活该孤单", "别逃避"],
        reference: "你一方面希望拥有更亲密的关系，另一方面又常常回避见面的机会，这两者之间似乎有些不一致，你自己是怎么理解这种拉扯的？"
      },
      {
        id: "procrastinate-thesis",
        technique: "action-plan",
        title: "论文迟迟未动笔",
        speaker: "小齐",
        context: "来访者希望推进论文，但迟迟难以开始。",
        message: "我知道论文得抓紧了，可每次打开文档就不知道从哪写起，总觉得准备得还不够，于是又拖过去了。",
        keyFacts: [
          ["论文", "写论文"],
          ["不知道从哪写", "不知道怎么写", "无从下手"],
          ["准备不够", "准备得不够"],
          ["拖", "拖延"]
        ],
        avoidWords: ["你应该每天写", "别拖了", "你太懒", "马上开始"],
        reference: "如果你愿意，我们可以先不急着写正文，而是先定一个很小、很容易完成的第一步，比如今天只整理出论文的一个小标题或列出三个关键词。"
      },
      {
        id: "exercise-plan",
        technique: "action-plan",
        title: "想运动却坚持不下来",
        speaker: "小陶",
        context: "来访者想养成运动习惯，但一直没能坚持。",
        message: "我一直想开始运动，办过卡也下过决心，可每次都坚持不到两周就放弃了。我觉得自己应该多动一动，但就是很难开始。",
        keyFacts: [
          ["运动", "锻炼"],
          ["办卡", "下决心"],
          ["坚持不到", "放弃", "坚持不下来"],
          ["难开始"]
        ],
        avoidWords: ["你太没毅力", "你应该坚持", "别放弃", "马上跑五公里"],
        reference: "我们可以先不追求每天都运动，而是选一个你最容易做到的小步骤，比如每周挑两天、每次散步十五分钟。你觉得这个开始方式可以接受吗？"
      }
    ],

    articles: [
      {
        id: "restatement-basics",
        category: "共情",
        title: "关于重述技术，你需要掌握的三个重点",
        summary: "重述不是机械复读，而是准确提炼、简洁表达和核对理解。",
        cover: "assets/images/illustrations/article-restatement.svg",
        readMinutes: 5,
        likes: 596,
        publishedAt: "2026-08-20",
        content: [
          { type: "lead", text: "在助人谈话中，重述是最基础、也最容易被低估的技术之一。恰当的重述能够让对方感到自己被认真倾听，同时帮助谈话聚焦。" },
          { type: "heading", text: "一、重述不是逐字重复" },
          { type: "paragraph", text: "逐字重复容易让回应显得机械。更合适的做法是抓住人物、事件、时间和主要变化，用更简洁的语言重新组织。" },
          { type: "quote", text: "来访者：我投了很多简历，但一直没有回应。回应：你最近投出的简历一直没有收到反馈。" },
          { type: "heading", text: "二、不要提前解释情绪" },
          { type: "paragraph", text: "如果当前训练目标是内容重述，就应先准确回应来访者明确表达的事实，避免把自己推测的情绪或原因加入回应。" },
          { type: "heading", text: "三、给对方留下修正空间" },
          { type: "paragraph", text: "重述是一种理解核对。表达可以保持自然和开放，让来访者有机会补充或纠正，而不是把回应说成确定结论。" }
        ]
      },
      {
        id: "empathy-process",
        category: "共情",
        title: "如何在咨询过程中形成完整的共情回应",
        summary: "从听见事实，到理解情绪，再到把意义还给来访者。",
        cover: "assets/images/illustrations/article-empathy.svg",
        readMinutes: 7,
        likes: 421,
        publishedAt: "2026-08-18",
        content: [
          { type: "lead", text: "共情不是一句固定话术，而是持续理解、核对和调整的过程。" },
          { type: "heading", text: "先理解，再回应" },
          { type: "paragraph", text: "有效共情通常从准确倾听开始。先区分对方说了什么、感受如何以及这件事对其意味着什么，再决定回应深度。" },
          { type: "heading", text: "回应应贴近当前表达" },
          { type: "paragraph", text: "回应太浅可能让对方感到敷衍，回应太深则可能带入未经确认的解释。合适的回应需要跟随来访者当前愿意表达的程度。" },
          { type: "quote", text: "共情的重点不是证明我们理解得多深，而是帮助对方更清楚地理解自己。" }
        ]
      },
      {
        id: "questions-with-care",
        category: "领悟",
        title: "助人谈话中，怎样提问才不会带来压力",
        summary: "从连续追问转向开放、单一、可回答的问题。",
        cover: "assets/images/illustrations/article-questions.svg",
        readMinutes: 6,
        likes: 283,
        publishedAt: "2026-08-12",
        content: [
          { type: "lead", text: "提问能够帮助探索，也可能让谈话变成审问。区别往往在于提问的目的、节奏和表达方式。" },
          { type: "heading", text: "一次只问一件事" },
          { type: "paragraph", text: "多个问题连续出现时，对方容易不知道从哪里回答。把问题拆开，并在每个回答后留出回应空间。" },
          { type: "heading", text: "少问为什么，多问发生了什么" },
          { type: "paragraph", text: "为什么有时带有追责意味。询问事情如何发生、当时注意到了什么，通常更容易展开。" }
        ]
      },
      {
        id: "small-action-plan",
        category: "行动",
        title: "把宽泛目标变成一个可以开始的小行动",
        summary: "具体行动应当清晰、可执行，并由来访者共同决定。",
        cover: "assets/images/illustrations/article-action.svg",
        readMinutes: 4,
        likes: 198,
        publishedAt: "2026-08-08",
        content: [
          { type: "lead", text: "行动计划并不是替来访者做决定，而是帮助其找到愿意尝试、能够做到的下一步。" },
          { type: "heading", text: "从小到足以开始" },
          { type: "paragraph", text: "与其制定宏大的改变计划，不如先找到在时间、资源和心理负担上都可承受的小步骤。" },
          { type: "quote", text: "一个好的下一步，通常具体到可以回答：何时、在哪里、做什么、做到什么程度。" }
        ]
      }
    ],

    demoRecords: [
      {
        id: "demo-001",
        techniqueId: "restatement",
        techniqueName: "重述",
        caseId: "job-search",
        caseTitle: "求职没有回应",
        date: "2026-08-24 19:35",
        score: 72,
        level: "良好",
        dimensions: { accuracy: 76, concise: 68, neutral: 72, natural: 71 },
        userReply: "你最近投了很多简历，但一直没有得到回应。",
        clientMessage: "我这一个月一直在找工作，投了很多简历，但没有收到一个回应。",
        feedback: "已经抓住了求职与没有回应这两个核心事实，可以进一步保留时间信息。",
        suggestion: "尝试加入“这一个月”这一时间线索。"
      },
      {
        id: "demo-002",
        techniqueId: "restatement",
        techniqueName: "重述",
        caseId: "study-pressure",
        caseTitle: "复习计划被打乱",
        date: "2026-08-26 21:12",
        score: 79,
        level: "良好",
        dimensions: { accuracy: 82, concise: 78, neutral: 80, natural: 76 },
        userReply: "原本安排好的复习计划被临时任务打乱了，你现在不知道该先做什么。",
        clientMessage: "我的复习计划被小组作业和临时通知打乱了，我都不知道该先做哪一件。",
        feedback: "核心事实完整，表达自然，没有加入未经说明的判断。",
        suggestion: "可以稍微缩短句子，使回应更加利落。"
      },
      {
        id: "demo-003",
        techniqueId: "restatement",
        techniqueName: "重述",
        caseId: "friend-distance",
        caseTitle: "朋友逐渐疏远",
        date: "2026-08-28 20:06",
        score: 84,
        level: "优秀",
        dimensions: { accuracy: 87, concise: 82, neutral: 85, natural: 83 },
        userReply: "你发现朋友最近回复变少，想问问发生了什么，又担心自己显得太敏感。",
        clientMessage: "她最近经常隔很久才回消息，我想问她发生了什么，又怕自己显得太敏感。",
        feedback: "完整保留了来访者表达中的两难，信息准确且中立。",
        suggestion: "保持当前的回应长度和语气。"
      }
    ]
  };
})(window);
