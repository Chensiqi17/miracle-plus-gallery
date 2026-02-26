import fs from "fs";
import path from "path";

const RAW_PATH = path.join(process.cwd(), "data", "data", "raw_data_fall_2023.md");
const OUT_PATH = path.join(process.cwd(), "data", "batches", "2023F.json");

// 与 lib/taxonomy 对齐的 tag 关键词推断： [ 关键词或正则, 标准 tag ]
const TAG_RULES = [
  ["大模型|LLM|大语言模型|语言模型", "大模型"],
  ["Agent|智能体|代理|数字员工", "AI Agent"],
  ["AI |人工智能|机器学习", "AI"],
  ["AIGC|生成式|多模态|音视频", "AIGC"],
  ["多模态", "多模态"],
  ["AI for Science|科学计算|科研", "AI for Science"],
  ["代码|Code|开发工具|程序员|开发者", "开发者工具"],
  ["算力|GPU|训练|推理|万卡", "算力"],
  ["数据|数据库|数据分析", "数据"],
  ["机器人|Robot|清洁机器人|具身", "机器人"],
  ["具身智能|具身", "具身智能"],
  ["芯片|半导体|光电|光谱", "芯片"],
  ["智能制造|清洁|洗地|扫地", "智能制造"],
  ["航天|卫星|电推进", "商业航天"],
  ["SaaS|企业服务|协同|To B|to B", "企业服务"],
  ["SaaS", "SaaS"],
  ["开源|Open Source", "开源"],
  ["教育|学习|教学|K12|升学", "教育"],
  ["游戏|Game|游戏化", "游戏"],
  ["医疗|健康|生命科学|脑机", "医疗健康"],
  ["脑机接口|数字人|数字分身", "脑机接口"],
  ["生物|合成生物", "生物科技"],
  ["元宇宙|XR|空间计算|3D|VR", "空间计算"],
  ["消费|C端|to C|To C", "消费应用"],
  ["电商|零售|跨境|出海", "电商"],
  ["安全|运维|AIOps", "安全"],
  ["金融|FinTech|支付", "FinTech"],
];

function inferTags(name, oneLiner, description) {
  const text = [name, oneLiner, description].filter(Boolean).join(" ");
  const lower = text.toLowerCase();
  const seen = new Set();
  const tags = [];
  for (const [pattern, tag] of TAG_RULES) {
    if (seen.has(tag)) continue;
    const re = new RegExp(pattern, "i");
    if (re.test(text) || re.test(lower)) {
      seen.add(tag);
      tags.push(tag);
      if (tags.length >= 5) break;
    }
  }
  // 若没有任何匹配，根据“大模型/Agent”等泛化给一个默认
  if (tags.length === 0 && (/AI|智能|模型|agent/i.test(text))) {
    tags.push("AI");
  }
  return tags;
}

// 高校：bio 中出现的关键词 -> 归一化名称（与 lib/taxonomy UNI_ALIASES 一致）
const UNI_MATCH = [
  ["清华大学", "清华大学"], ["清华", "清华大学"], ["Tsinghua", "清华大学"], ["THU", "清华大学"],
  ["北京大学", "北京大学"], ["北大", "北京大学"], ["Peking University", "北京大学"], ["PKU", "北京大学"],
  ["上海交通大学", "上海交通大学"], ["上交", "上海交通大学"], ["SJTU", "上海交通大学"], ["Shanghai Jiao Tong", "上海交通大学"],
  ["浙江大学", "浙江大学"], ["浙大", "浙江大学"], ["ZJU", "浙江大学"], ["Zhejiang University", "浙江大学"],
  ["复旦大学", "复旦大学"], ["Fudan", "复旦大学"],
  ["中国科学技术大学", "中国科学技术大学"], ["中科大", "中国科学技术大学"], ["USTC", "中国科学技术大学"],
  ["南京大学", "南京大学"], ["NJU", "南京大学"],
  ["华中科技大学", "华中科技大学"], ["华科", "华中科技大学"], ["HUST", "华中科技大学"],
  ["武汉大学", "武汉大学"], ["WHU", "武汉大学"],
  ["北京航空航天大学", "北京航空航天大学"], ["北航", "北京航空航天大学"], ["BUAA", "北京航空航天大学"], ["Beihang", "北京航空航天大学"],
  ["哈尔滨工业大学", "哈尔滨工业大学"], ["哈工大", "哈尔滨工业大学"], ["HIT", "哈尔滨工业大学"],
  ["北京理工大学", "北京理工大学"], ["BIT", "北京理工大学"],
  ["中国科学院", "中国科学院"], ["UCAS", "中国科学院"], ["中科院", "中国科学院"],
  ["香港大学", "香港大学"], ["HKU", "香港大学"],
  ["香港科技大学", "香港科技大学"], ["HKUST", "香港科技大学"],
  ["香港中文大学", "香港中文大学"], ["CUHK", "香港中文大学"],
  ["香港理工大学", "香港理工大学"],
  ["南京航空航天大学", "南京航空航天大学"],
  ["深圳大学", "深圳大学"], ["电子科技大学", "电子科技大学"], ["成都信息工程大学", "成都信息工程大学"],
  ["伦敦商学院", "伦敦商学院"], ["华盛顿大学", "华盛顿大学"],
  ["加州大学伯克利", "UC Berkeley"], ["伯克利", "UC Berkeley"], ["Berkeley", "UC Berkeley"], ["约翰霍普金斯", "约翰霍普金斯大学"],
  ["Virginia Tech", "Virginia Tech"], ["UIUC", "UIUC"], ["Reed College", "Reed College"],
  ["南洋理工大学", "南洋理工大学"], ["NTU", "南洋理工大学"], ["NUS", "NUS"],
  ["MIT", "MIT"], ["斯坦福", "Stanford"], ["Stanford", "Stanford"], ["哈佛", "Harvard"], ["Harvard", "Harvard"],
  ["CMU", "CMU"], ["卡耐基梅隆", "CMU"], ["牛津", "Oxford"], ["剑桥", "Cambridge"], ["Oxford", "Oxford"], ["Cambridge", "Cambridge"],
  ["UCLA", "UCLA"], ["UCSD", "UCSD"], ["芝加哥大学", "芝加哥大学"],
  ["上海财经大学", "上海财经大学"], ["中国传媒大学", "中国传媒大学"], ["北京外国语大学", "北京外国语大学"],
  ["中央美术学院", "中央美术学院"], ["中南大学", "中南大学"], ["西安交通大学", "西安交通大学"],
  ["伊利诺伊大学香槟", "UIUC"], ["乔治华盛顿大学", "乔治华盛顿大学"], ["密歇根大学", "密歇根大学"],
  ["南加大", "USC"], ["USC", "USC"], ["圣何塞州立大学", "圣何塞州立大学"], ["多伦多大学", "多伦多大学"],
  ["莱斯大学", "莱斯大学"], ["爱丁堡大学", "爱丁堡大学"], ["阿尔伯塔大学", "阿尔伯塔大学"],
  ["芬兰阿尔托大学", "芬兰阿尔托大学"], ["意大利米兰理工", "意大利米兰理工"], ["谢菲尔德大学", "谢菲尔德大学"],
  ["南方科技大学", "南方科技大学"], ["康奈尔大学", "康奈尔大学"], ["Cornell", "康奈尔大学"],
  ["大连理工大学", "大连理工大学"], ["大连理工", "大连理工大学"],
];

// 公司：别名/关键词 -> 归一化名称（与 lib/founder-analysis COMPANY_ALIASES 一致，且不含“比赛/杯”等）
const COMPANY_MATCH = [
  ["字节跳动", "字节跳动"], ["字节", "字节跳动"], ["bytedance", "字节跳动"], ["抖音", "字节跳动"], ["今日头条", "字节跳动"],
  ["腾讯", "腾讯"], ["tencent", "腾讯"], ["微信", "腾讯"], ["阿里巴巴", "阿里巴巴"], ["阿里", "阿里巴巴"], ["alibaba", "阿里巴巴"], ["蚂蚁", "阿里巴巴"], ["飞书", "飞书"],
  ["百度", "百度"], ["baidu", "百度"],
  ["美团", "美团"], ["京东", "京东"], ["华为", "华为"], ["滴滴", "滴滴"], ["didi", "滴滴"],
  ["Microsoft", "微软"], ["微软", "微软"], ["MSRA", "微软亚洲研究院"], ["微软亚洲研究院", "微软亚洲研究院"],
  ["Google", "Google"], ["谷歌", "Google"], ["Meta", "Meta"], ["facebook", "Meta"], ["Amazon", "亚马逊"], ["Apple", "苹果"],
  ["大疆", "大疆"], ["DJI", "大疆"], ["dji", "大疆"],
  ["喜马拉雅", "喜马拉雅"], ["ViaBot", "ViaBot"], ["HDR", "HDR"],
  ["Uber", "Uber"], ["Waymo", "Waymo"], ["小鹏", "小鹏"], ["Litentry", "Litentry"],
  ["阿里巴巴", "阿里巴巴"], ["蚂蚁集团", "蚂蚁集团"], ["ThoughtWorks", "ThoughtWorks"],
  ["Snap", "Snap"], ["Snap Inc", "Snap"], ["TikTok", "TikTok"], ["IBM", "IBM"], ["AMD", "AMD"], ["Broadcom", "Broadcom"],
  ["ARM", "ARM"], ["华为海思", "华为海思"], ["AccelerComm", "AccelerComm"], ["Cognovo", "Cognovo"],
  ["百度飞桨", "百度"],
  ["滴滴 AI Labs", "滴滴"], ["滴滴 AI Labs", "滴滴"],
  ["网易", "网易"], ["网易", "网易"], ["雷霆", "雷霆"], ["动视", "动视"], ["Cohere", "Cohere"],
  ["National Health Service", "National Health Service"], ["Jina AI", "Jina AI"],
  ["英特尔", "英特尔"], ["Intel", "英特尔"], ["毕马威", "毕马威"], ["帆软", "帆软"],
  ["中通快递", "中通快递"], ["360", "360"], ["西门子", "西门子"], ["趋势科技", "趋势科技"],
];

// 仅当 bio 中出现“竞赛语境”短语时才排除该公司（如 百度之星、微软杯），避免误伤“一等奖。曾任滴滴”等
const SKIP_COMPANY_IF_BIO_HAS = [
  ["百度之星", "百度"],
  ["微软杯", "微软"],
];

function extractEducationAndWork(bio) {
  if (!bio || typeof bio !== "string") return { education: [], work_history: [] };
  const education = [];
  const work_history = [];
  const seenE = new Set();
  const seenW = new Set();
  // 按关键词长度降序，优先匹配更长
  const sortedUni = [...UNI_MATCH].sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, norm] of sortedUni) {
    if (bio.includes(keyword) && !seenE.has(norm)) {
      seenE.add(norm);
      education.push(norm);
    }
  }
  const sortedCo = [...COMPANY_MATCH].sort((a, b) => b[0].length - a[0].length);
  for (const [alias, norm] of sortedCo) {
    if (!bio.includes(alias)) continue;
    const skip = SKIP_COMPANY_IF_BIO_HAS.some(([phrase, skipNorm]) => bio.includes(phrase) && skipNorm === norm);
    if (skip) continue;
    if (!seenW.has(norm)) {
      seenW.add(norm);
      work_history.push(norm);
    }
  }
  return { education, work_history };
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error(`Raw file not found: ${RAW_PATH}`);
    console.error("请先创建 data/raw/2023F.txt 并把整篇 2023 秋季路演文章粘进去。");
    process.exit(1);
  }

  const text = fs.readFileSync(RAW_PATH, "utf-8");
  const lines = text.split(/\r?\n/);

  // 从“以下为部分路演项目名单”之后开始解析
  const startIndex = lines.findIndex((l) => l.includes("以下为部分路演项目名单"));
  if (startIndex === -1) {
    console.error("没有在原文中找到“以下为部分路演项目名单”这句话，检查 raw 文本是否完整。");
    process.exit(1);
  }

  const projects = [];
  let current = null;

  const flushCurrent = () => {
    if (!current) return;
    // 至少要有名字和一句话介绍才算有效项目
    if (current.name && current.one_liner) {
      current.tags = inferTags(current.name, current.one_liner, current.description);
      projects.push(current);
    }
    current = null;
  };

  const makeId = (index) => `2023F-${String(index).padStart(3, "0")}`;

  // 用一个简单的规则判断“这一行是不是新项目名”：
  // - 不以“图片 / 一句话介绍 / 项目简介 / 公司介绍 / 项目介绍 / 团队介绍”开头
  // - 行长不要太长（< 30）
  // - 下一行是“图片”或包含“一句话介绍”
  const isPotentialNameLine = (line, nextLine) => {
    const l = line.trim();
    if (!l) return false;
    if (l.length > 30) return false;
    if (/^(图片|一句话介绍|项目简介|公司介绍|项目介绍|团队介绍)/.test(l)) {
      return false;
    }
    const n = (nextLine || "").trim();
    if (!n) return false;
    if (n === "图片" || n.includes("一句话介绍")) return true;
    return false;
  };

  let i = startIndex + 1;

  while (i < lines.length) {
    let line = lines[i].trim();

    // 跳过空行
    if (!line) {
      i++;
      continue;
    }

    // 跳过“图片”行
    if (line === "图片") {
      i++;
      continue;
    }

    // 一句话介绍
    if (line.startsWith("一句话介绍")) {
      if (!current) {
        // 如果没有 current，说明原文格式有点乱，直接跳过这一块
        i++;
        continue;
      }
      const idx = line.indexOf("：");
      const one = idx >= 0 ? line.slice(idx + 1).trim() : line.replace("一句话介绍", "").trim();
      current.one_liner = one;
      i++;
      continue;
    }

    // 项目/公司介绍
    if (
      line.startsWith("项目简介") ||
      line.startsWith("公司介绍") ||
      line.startsWith("项目介绍")
    ) {
      if (!current) {
        i++;
        continue;
      }
      const descParts = [];
      const idx = line.indexOf("：");
      if (idx >= 0 && idx < line.length - 1) {
        const rest = line.slice(idx + 1).trim();
        if (rest) descParts.push(rest);
      }
      i++;
      while (i < lines.length) {
        let l = lines[i].trim();
        // 到团队介绍 / 新项目名 就结束 description
        if (
          l.startsWith("团队介绍") ||
          isPotentialNameLine(l, lines[i + 1]) ||
          l.startsWith("一句话介绍")
        ) {
          break;
        }
        if (l === "图片") {
          i++;
          continue;
        }
        descParts.push(l);
        i++;
      }
      current.description = descParts.join("\n");
      continue;
    }

    // 团队介绍 -> founders 粗解析
    if (line.startsWith("团队介绍")) {
      if (!current) {
        i++;
        continue;
      }
      const founders = [];
      let bufName = "";
      let bufBio = [];

      const flushFounder = () => {
        if (!bufName && bufBio.length === 0) return;
        const bio = bufBio.join(" ");
        const { education, work_history } = extractEducationAndWork(bio);
        founders.push({
          name: bufName || "未知",
          role: "创始人",
          bio,
          education,
          work_history,
        });
        bufName = "";
        bufBio = [];
      };

      i++;
      while (i < lines.length) {
        let l = lines[i].trim();
        if (!l) {
          // 空行表示当前 founder 结束
          flushFounder();
          i++;
          continue;
        }

        // 新项目块开始则退出
        if (isPotentialNameLine(l, lines[i + 1])) {
          flushFounder();
          break;
        }

        // 形如“姓名：xxx”的行，认为是新的 founder 开头
        const m = l.match(/^([^：:]+)[：:](.+)$/);
        if (m) {
          // 之前的 founder 先收尾
          flushFounder();
          bufName = m[1].trim();
          bufBio.push(m[2].trim());
          i++;
          continue;
        }

        // 其他行都当作当前 founder 的 bio 续写
        bufBio.push(l);
        i++;
      }

      flushFounder();
      current.founders = founders;
      continue;
    }

    // 走到这里，优先判断是不是新项目名
    if (isPotentialNameLine(line, lines[i + 1])) {
      // 收尾上一个项目
      flushCurrent();
      const index = projects.length + (current ? 1 : 1);
      const id = makeId(index);
      current = {
        id,
        batch_id: "2023F",
        name: line,
        one_liner: "",
        description: "",
        image_url: `/images/projects/${id}.jpg`,
        tags: [],
        founders: [],
      };
      i++;
      continue;
    }

    // 其他情况：可能是正文前的无关文字，直接跳过
    i++;
  }

  // 收尾最后一个
  flushCurrent();

  if (projects.length === 0) {
    console.error("没有成功解析出任何项目，请检查 raw 文本格式。");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(projects, null, 2), "utf-8");
  console.log(`✅ 已生成 ${projects.length} 个项目到 ${OUT_PATH}`);
}

main();

