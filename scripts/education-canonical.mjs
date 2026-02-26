/**
 * 高校 education 规范名映射：所有别名/英文/缩写 -> 统一中文名
 * 用于：1) 批量归一化 data/batches/*.json  2) parse 脚本输出  3) 统计对齐
 */
export const EDU_CANONICAL = {
  // 清华
  "清华大学": "清华大学", "清华": "清华大学", "Tsinghua": "清华大学", "Tsinghua University": "清华大学", "THU": "清华大学",
  // 北大
  "北京大学": "北京大学", "北大": "北京大学", "Peking University": "北京大学", "PKU": "北京大学",
  // 上交
  "上海交通大学": "上海交通大学", "上交": "上海交通大学", "SJTU": "上海交通大学", "Shanghai Jiao Tong": "上海交通大学", "Shanghai Jiao Tong University": "上海交通大学",
  // 浙大
  "浙江大学": "浙江大学", "浙大": "浙江大学", "ZJU": "浙江大学", "Zhejiang University": "浙江大学",
  // 复旦
  "复旦大学": "复旦大学", "Fudan": "复旦大学", "Fudan University": "复旦大学",
  // 中科大
  "中国科学技术大学": "中国科学技术大学", "中科大": "中国科学技术大学", "USTC": "中国科学技术大学",
  // 南大
  "南京大学": "南京大学", "NJU": "南京大学",
  // 华科
  "华中科技大学": "华中科技大学", "华科": "华中科技大学", "HUST": "华中科技大学",
  // 武大
  "武汉大学": "武汉大学", "WHU": "武汉大学",
  // 北航
  "北京航空航天大学": "北京航空航天大学", "北航": "北京航空航天大学", "BUAA": "北京航空航天大学", "Beihang": "北京航空航天大学",
  // 哈工大
  "哈尔滨工业大学": "哈尔滨工业大学", "哈工大": "哈尔滨工业大学", "HIT": "哈尔滨工业大学",
  // 北理工
  "北京理工大学": "北京理工大学", "BIT": "北京理工大学",
  // 中科院
  "中国科学院": "中国科学院", "UCAS": "中国科学院", "中科院": "中国科学院", "Chinese Academy of Sciences": "中国科学院",
  // 人大
  "中国人民大学": "中国人民大学", "人大": "中国人民大学", "Renmin University of China": "中国人民大学",
  // 香港
  "香港大学": "香港大学", "HKU": "香港大学",
  "香港科技大学": "香港科技大学", "HKUST": "香港科技大学",
  "香港中文大学": "香港中文大学", "CUHK": "香港中文大学",
  "香港中文大学(深圳)": "香港中文大学(深圳)", "CUHK(SZ)": "香港中文大学(深圳)",
  "香港理工大学": "香港理工大学",
  "香港城市大学": "香港城市大学", "City University of Hong Kong": "香港城市大学",
  "香港浸会大学": "香港浸会大学", "Hong Kong Baptist University": "香港浸会大学",
  // 国内其他
  "南京航空航天大学": "南京航空航天大学",
  "深圳大学": "深圳大学",
  "电子科技大学": "电子科技大学",
  "成都信息工程大学": "成都信息工程大学",
  "上海财经大学": "上海财经大学",
  "中国传媒大学": "中国传媒大学",
  "北京外国语大学": "北京外国语大学",
  "中央美术学院": "中央美术学院",
  "中南大学": "中南大学",
  "西安交通大学": "西安交通大学", "西交": "西安交通大学",
  "南方科技大学": "南方科技大学",
  "大连理工大学": "大连理工大学", "大连理工": "大连理工大学",
  "同济大学": "同济大学", "Tongji": "同济大学",

  // 麻省理工
  "麻省理工学院": "麻省理工学院", "麻省理工": "麻省理工学院", "MIT": "麻省理工学院", "Massachusetts Institute of Technology": "麻省理工学院",
  // 斯坦福
  "斯坦福大学": "斯坦福大学", "斯坦福": "斯坦福大学", "Stanford": "斯坦福大学", "Stanford University": "斯坦福大学",
  // 哈佛
  "哈佛大学": "哈佛大学", "哈佛": "哈佛大学", "Harvard": "哈佛大学", "Harvard University": "哈佛大学",
  "哈佛医学院": "哈佛医学院", "Harvard Medical School": "哈佛医学院",
  // 剑桥
  "剑桥大学": "剑桥大学", "剑桥": "剑桥大学", "Cambridge": "剑桥大学", "University of Cambridge": "剑桥大学",
  // 牛津
  "牛津大学": "牛津大学", "牛津": "牛津大学", "Oxford": "牛津大学", "University of Oxford": "牛津大学",
  // 伯克利
  "加州大学伯克利分校": "加州大学伯克利分校", "加州大学伯克利": "加州大学伯克利分校", "伯克利": "加州大学伯克利分校", "UC Berkeley": "加州大学伯克利分校", "Berkeley": "加州大学伯克利分校", "University of California Berkeley": "加州大学伯克利分校", "University of California, Berkeley": "加州大学伯克利分校",
  // UCLA
  "加州大学洛杉矶分校": "加州大学洛杉矶分校", "UCLA": "加州大学洛杉矶分校",
  // UCSD
  "加州大学圣地亚哥分校": "加州大学圣地亚哥分校", "UCSD": "加州大学圣地亚哥分校", "UC San Diego": "加州大学圣地亚哥分校",
  // USC
  "南加州大学": "南加州大学", "南加大": "南加州大学", "USC": "南加州大学",
  // UIUC
  "伊利诺伊大学香槟分校": "伊利诺伊大学香槟分校", "伊利诺伊大学香槟": "伊利诺伊大学香槟分校", "UIUC": "伊利诺伊大学香槟分校", "University of Illinois at Urbana-Champaign": "伊利诺伊大学香槟分校",
  // CMU
  "卡耐基梅隆大学": "卡耐基梅隆大学", "卡耐基梅隆": "卡耐基梅隆大学", "CMU": "卡耐基梅隆大学", "Carnegie Mellon University": "卡耐基梅隆大学", "Carnegie Mellon": "卡耐基梅隆大学",
  // 康奈尔
  "康奈尔大学": "康奈尔大学", "Cornell": "康奈尔大学", "Cornell University": "康奈尔大学",
  // 其他美国
  "芝加哥大学": "芝加哥大学", "University of Chicago": "芝加哥大学",
  "约翰霍普金斯大学": "约翰霍普金斯大学", "约翰霍普金斯": "约翰霍普金斯大学", "Johns Hopkins University": "约翰霍普金斯大学",
  "弗吉尼亚理工": "弗吉尼亚理工", "Virginia Tech": "弗吉尼亚理工",
  "莱斯大学": "莱斯大学", "Rice University": "莱斯大学",
  "乔治华盛顿大学": "乔治华盛顿大学",
  "华盛顿大学": "华盛顿大学", "University of Washington": "华盛顿大学",
  "密歇根大学": "密歇根大学", "University of Michigan": "密歇根大学",
  "圣何塞州立大学": "圣何塞州立大学",
  "加州理工学院": "加州理工学院", "Caltech": "加州理工学院",
  "佐治亚理工学院": "佐治亚理工学院", "Georgia Tech": "佐治亚理工学院", "Georgia Institute of Technology": "佐治亚理工学院",
  "杜克大学": "杜克大学", "Duke University": "杜克大学",
  "哥伦比亚大学": "哥伦比亚大学", "Columbia University": "哥伦比亚大学", "Columbia": "哥伦比亚大学",
  "耶鲁大学": "耶鲁大学", "Yale": "耶鲁大学", "Yale University": "耶鲁大学",
  "纽约大学": "纽约大学", "NYU": "纽约大学",
  "宾夕法尼亚大学": "宾夕法尼亚大学", "UPenn": "宾夕法尼亚大学", "University of Pennsylvania": "宾夕法尼亚大学",
  "沃顿商学院": "沃顿商学院", "Wharton": "沃顿商学院",
  "布朗大学": "布朗大学", "Brown University": "布朗大学",
  "达特茅斯学院": "达特茅斯学院", "Dartmouth College": "达特茅斯学院",
  "西北大学": "西北大学", "Northwestern University": "西北大学",
  "伍斯特理工学院": "伍斯特理工学院", "WPI": "伍斯特理工学院",
  "里德学院": "里德学院", "Reed College": "里德学院",

  // 英国
  "伦敦大学学院": "伦敦大学学院", "UCL": "伦敦大学学院", "University College London": "伦敦大学学院",
  "帝国理工学院": "帝国理工学院", "Imperial College London": "帝国理工学院", "ICL": "帝国理工学院", "Imperial": "帝国理工学院",
  "伦敦商学院": "伦敦商学院",
  "伦敦国王学院": "伦敦国王学院", "KCL": "伦敦国王学院", "King's College London": "伦敦国王学院",
  "爱丁堡大学": "爱丁堡大学", "University of Edinburgh": "爱丁堡大学",
  "谢菲尔德大学": "谢菲尔德大学",
  "皇家艺术学院": "皇家艺术学院", "Royal College of Art": "皇家艺术学院", "RCA": "皇家艺术学院",

  // 新加坡
  "新加坡国立大学": "新加坡国立大学", "NUS": "新加坡国立大学", "National University of Singapore": "新加坡国立大学",
  "南洋理工大学": "南洋理工大学", "NTU": "南洋理工大学", "Nanyang Technological University": "南洋理工大学",

  // 加拿大
  "多伦多大学": "多伦多大学", "University of Toronto": "多伦多大学",
  "滑铁卢大学": "滑铁卢大学", "University of Waterloo": "滑铁卢大学",
  "阿尔伯塔大学": "阿尔伯塔大学", "University of Alberta": "阿尔伯塔大学",

  // 欧洲
  "苏黎世联邦理工学院": "苏黎世联邦理工学院", "ETH Zurich": "苏黎世联邦理工学院", "ETH": "苏黎世联邦理工学院", "Swiss Federal Institute of Technology": "苏黎世联邦理工学院",
  "洛桑联邦理工学院": "洛桑联邦理工学院", "EPFL": "洛桑联邦理工学院",
  "慕尼黑工业大学": "慕尼黑工业大学", "Technical University of Munich": "慕尼黑工业大学", "TUM": "慕尼黑工业大学",
  "亚琛工业大学": "亚琛工业大学", "RWTH Aachen University": "亚琛工业大学", "RWTH Aachen": "亚琛工业大学",
  "芬兰阿尔托大学": "芬兰阿尔托大学", "阿尔托大学": "芬兰阿尔托大学", "Aalto University": "芬兰阿尔托大学",
  "意大利米兰理工学院": "意大利米兰理工学院", "意大利米兰理工": "意大利米兰理工学院", "Politecnico di Milano": "意大利米兰理工学院",

  // 日本
  "东京大学": "东京大学", "University of Tokyo": "东京大学", "The University of Tokyo": "东京大学",
};

/**
 * 将任意 education 字符串转为规范中文名；未在映射中的原样返回。
 */
export function toCanonicalEducation(name) {
  if (name == null || typeof name !== "string") return name;
  const t = name.trim();
  return EDU_CANONICAL[t] ?? t;
}
