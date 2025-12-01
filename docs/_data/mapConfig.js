// 地图配置 - 根据实际地图调整
export const mapConfig = {
  // 整个地图画布尺寸 - 根据实际地图比例调整
  canvasWidth: 8000,
  canvasHeight: 4500,
  
  // 地图区域配置 - 根据实际地图布局调整
  regions: {
    easternKingdoms: {
      name: { zh: '东部王国', en: 'Eastern Kingdoms' },
      bounds: { x: 4000, y: 0, width: 4000, height: 4500 }, // 右侧
      tiles: {
        cols: 8,
        rows: 9,
        tileWidth: 500,
        tileHeight: 500
      }
    },
    kalimdor: {
      name: { zh: '卡利姆多', en: 'Kalimdor' },
      bounds: { x: 0, y: 0, width: 4000, height: 4500 }, // 左侧
      tiles: {
        cols: 8,
        rows: 9,
        tileWidth: 500,
        tileHeight: 500
      }
    }
  },

  // 点位类型配置
  pointTypes: {
    flightMaster: {
      name: { zh: '飞行管理员', en: 'Flight Master' },
      icon: '✈️',
      color: '#4CAF50',
      size: 20
    },
    capital: {
      name: { zh: '主城', en: 'Capital' },
      icon: '🏰',
      color: '#FF5722',
      size: 28
    },
    town: {
      name: { zh: '城镇', en: 'Town' },
      icon: '🏠',
      color: '#2196F3',
      size: 24
    },
    dungeon: {
      name: { zh: '副本', en: 'Dungeon' },
      icon: '⚔️',
      color: '#9C27B0',
      size: 22
    }
  },

  // 阵营配置
  factions: {
    alliance: {
      name: { zh: '联盟', en: 'Alliance' },
      color: '#0078FF'
    },
    horde: {
      name: { zh: '部落', en: 'Horde' },
      color: '#E10B00'
    },
    neutral: {
      name: { zh: '中立', en: 'Neutral' },
      color: '#FFD700'
    }
  }
}

// 飞行点数据 - 根据实际地图位置重新调整坐标
export const flightPoints = {
  easternKingdoms: [
    // 联盟飞行点 - 东部王国
    {
      id: 'stormwind',
      name: { zh: '暴风城', en: 'Stormwind City' },
      type: 'capital',
      faction: 'alliance',
      position: { x: 4800, y: 2800 }, // 暴风城位置
      connections: ['ironforge', 'darkshire', 'lakeshire', 'sentinelhill']
    },
    {
      id: 'ironforge',
      name: { zh: '铁炉堡', en: 'Ironforge' },
      type: 'capital',
      faction: 'alliance',
      position: { x: 4500, y: 1800 }, // 铁炉堡位置
      connections: ['stormwind', 'menethil', 'thelsamar']
    },
    {
      id: 'menethil',
      name: { zh: '米奈希尔港', en: 'Menethil Harbor' },
      type: 'town',
      faction: 'alliance',
      position: { x: 4300, y: 1500 }, // 湿地位置
      connections: ['ironforge', 'Theramore']
    },
    {
      id: 'darkshire',
      name: { zh: '夜色镇', en: 'Darkshire' },
      type: 'town',
      faction: 'alliance',
      position: { x: 4800, y: 3200 }, // 暮色森林位置
      connections: ['stormwind']
    },
    {
      id: 'lakeshire',
      name: { zh: '湖畔镇', en: 'Lakeshire' },
      type: 'town',
      faction: 'alliance',
      position: { x: 4700, y: 2600 }, // 赤脊山位置
      connections: ['stormwind']
    },
    {
      id: 'sentinelhill',
      name: { zh: '哨兵岭', en: 'Sentinel Hill' },
      type: 'town',
      faction: 'alliance',
      position: { x: 4600, y: 3000 }, // 西部荒野位置
      connections: ['stormwind']
    },
    {
      id: 'thelsamar',
      name: { zh: '塞尔萨玛', en: 'Thelsamar' },
      type: 'town',
      faction: 'alliance',
      position: { x: 4400, y: 2000 }, // 洛克莫丹位置
      connections: ['ironforge']
    },
    {
      id: 'refugepoint',
      name: { zh: '避难营', en: 'Refuge Pointe' },
      type: 'town',
      faction: 'alliance',
      position: { x: 4700, y: 2200 }, // 阿拉希高地位置
      connections: ['ironforge']
    },
    {
      id: 'aeriepeak',
      name: { zh: '鹰巢山', en: 'Aerie Peak' },
      type: 'town',
      faction: 'alliance',
      position: { x: 4600, y: 1700 }, // 辛特兰位置
      connections: ['ironforge']
    },

    // 部落飞行点 - 东部王国
    {
      id: 'undercity',
      name: { zh: '幽暗城', en: 'Undercity' },
      type: 'capital',
      faction: 'horde',
      position: { x: 5100, y: 2000 }, // 提瑞斯法林地位置
      connections: ['tarrenmill', 'brill', 'hammerfall', 'gromgol']
    },
    {
      id: 'tarrenmill',
      name: { zh: '塔伦米尔', en: 'Tarren Mill' },
      type: 'town',
      faction: 'horde',
      position: { x: 4900, y: 2100 }, // 希尔斯布莱德丘陵位置
      connections: ['undercity']
    },
    {
      id: 'brill',
      name: { zh: '布瑞尔', en: 'Brill' },
      type: 'town',
      faction: 'horde',
      position: { x: 5050, y: 1950 }, // 提瑞斯法林地位置
      connections: ['undercity']
    },
    {
      id: 'hammerfall',
      name: { zh: '落锤镇', en: 'Hammerfall' },
      type: 'town',
      faction: 'horde',
      position: { x: 5200, y: 2300 }, // 阿拉希高地位置
      connections: ['undercity', 'kargath']
    },
    {
      id: 'kargath',
      name: { zh: '卡加斯', en: 'Kargath' },
      type: 'town',
      faction: 'horde',
      position: { x: 5000, y: 2500 }, // 荒芜之地位置
      connections: ['hammerfall']
    },
    {
      id: 'gromgol',
      name: { zh: '格罗姆高', en: 'Grom\'gol' },
      type: 'town',
      faction: 'horde',
      position: { x: 4800, y: 3500 }, // 荆棘谷位置
      connections: ['undercity']
    },
    {
      id: 'bootybay',
      name: { zh: '藏宝海湾', en: 'Booty Bay' },
      type: 'town',
      faction: 'neutral',
      position: { x: 4700, y: 3700 }, // 荆棘谷位置
      connections: []
    }
  ],

  kalimdor: [
    // 联盟飞行点 - 卡利姆多
    {
      id: 'theramore',
      name: { zh: '塞拉摩', en: 'Theramore' },
      type: 'town',
      faction: 'alliance',
      position: { x: 2800, y: 3200 }, // 尘泥沼泽位置
      connections: ['menethil', 'astranaar']
    },
    {
      id: 'astranaar',
      name: { zh: '阿斯特兰纳', en: 'Astranaar' },
      type: 'town',
      faction: 'alliance',
      position: { x: 3200, y: 2300 }, // 灰谷位置
      connections: ['Theramore', 'nijelspoint']
    },
    {
      id: 'nijelspoint',
      name: { zh: '尼耶尔前哨站', en: 'Nijel\'s Point' },
      type: 'town',
      faction: 'alliance',
      position: { x: 2500, y: 2500 }, // 凄凉之地位置
      connections: ['astranaar']
    },
    {
      id: 'feathermoon',
      name: { zh: '羽月要塞', en: 'Feathermoon' },
      type: 'town',
      faction: 'alliance',
      position: { x: 1800, y: 2800 }, // 菲拉斯位置
      connections: []
    },
    {
      id: 'thalanaar',
      name: { zh: '萨兰纳尔', en: 'Thalanaar' },
      type: 'town',
      faction: 'alliance',
      position: { x: 3000, y: 3000 }, // 千针石林位置
      connections: []
    },

    // 部落飞行点 - 卡利姆多
    {
      id: 'orgrimmar',
      name: { zh: '奥格瑞玛', en: 'Orgrimmar' },
      type: 'capital',
      faction: 'horde',
      position: { x: 2200, y: 1800 }, // 杜隆塔尔位置
      connections: ['thunderbluff', 'crossroads', 'splintertreepost']
    },
    {
      id: 'thunderbluff',
      name: { zh: '雷霆崖', en: 'Thunder Bluff' },
      type: 'capital',
      faction: 'horde',
      position: { x: 2800, y: 2000 }, // 莫高雷位置
      connections: ['orgrimmar', 'campmojache', 'shadowpreyvillage']
    },
    {
      id: 'crossroads',
      name: { zh: '十字路口', en: 'Crossroads' },
      type: 'town',
      faction: 'horde',
      position: { x: 2500, y: 1500 }, // 贫瘠之地位置
      connections: ['orgrimmar', 'campmojache']
    },
    {
      id: 'splintertreepost',
      name: { zh: '碎木岗哨', en: 'Splintertree Post' },
      type: 'town',
      faction: 'horde',
      position: { x: 3000, y: 1800 }, // 灰谷位置
      connections: ['orgrimmar']
    },
    {
      id: 'campmojache',
      name: { zh: '莫沙彻营地', en: 'Camp Mojache' },
      type: 'town',
      faction: 'horde',
      position: { x: 3200, y: 2700 }, // 菲拉斯位置
      connections: ['thunderbluff', 'crossroads']
    },
    {
      id: 'shadowpreyvillage',
      name: { zh: '葬影村', en: 'Shadowprey Village' },
      type: 'town',
      faction: 'horde',
      position: { x: 2300, y: 2300 }, // 凄凉之地位置
      connections: ['thunderbluff']
    },
    {
      id: 'sunrockretreat',
      name: { zh: '烈日石居', en: 'Sun Rock Retreat' },
      type: 'town',
      faction: 'horde',
      position: { x: 3000, y: 1200 }, // 石爪山脉位置
      connections: ['crossroads']
    },
    {
      id: 'freewindpost',
      name: { zh: '乱风岗', en: 'Freewind Post' },
      type: 'town',
      faction: 'horde',
      position: { x: 2700, y: 2800 }, // 千针石林位置
      connections: ['campmojache']
    },
    {
      id: 'zoramgaroutpost',
      name: { zh: '佐拉姆加前哨站', en: 'Zoram\'gar Outpost' },
      type: 'town',
      faction: 'horde',
      position: { x: 2800, y: 2000 }, // 灰谷位置
      connections: ['splintertreepost']
    }
  ]
}

// 副本数据 - 根据实际位置调整
export const dungeons = {
  easternKingdoms: [
    {
      id: 'deadmines',
      name: { zh: '死亡矿井', en: 'Deadmines' },
      type: 'dungeon',
      level: '15-20',
      position: { x: 4550, y: 3050 } // 西部荒野位置
    },
    {
      id: 'shadowfangkeep',
      name: { zh: '影牙城堡', en: 'Shadowfang Keep' },
      type: 'dungeon',
      level: '18-25',
      position: { x: 4950, y: 1900 } // 银松森林位置
    },
    {
      id: 'scarlemonastery',
      name: { zh: '血色修道院', en: 'Scarlet Monastery' },
      type: 'dungeon',
      level: '30-40',
      position: { x: 5150, y: 2050 } // 提瑞斯法林地位置
    },
    {
      id: 'blackrockspire',
      name: { zh: '黑石塔', en: 'Blackrock Spire' },
      type: 'dungeon',
      level: '55-60',
      position: { x: 4850, y: 2400 } // 燃烧平原位置
    },
    {
      id: 'stratholme',
      name: { zh: '斯坦索姆', en: 'Stratholme' },
      type: 'dungeon',
      level: '55-60',
      position: { x: 5300, y: 1900 } // 东瘟疫之地位置
    },
    {
      id: 'scholomance',
      name: { zh: '通灵学院', en: 'Scholomance' },
      type: 'dungeon',
      level: '55-60',
      position: { x: 5200, y: 1800 } // 西瘟疫之地位置
    }
  ],
  kalimdor: [
    {
      id: 'wailingcaverns',
      name: { zh: '哀嚎洞穴', en: 'Wailing Caverns' },
      type: 'dungeon',
      level: '15-25',
      position: { x: 2400, y: 1600 } // 贫瘠之地位置
    },
    {
      id: 'blackfathomdeeps',
      name: { zh: '黑暗深渊', en: 'Blackfathom Deeps' },
      type: 'dungeon',
      level: '20-30',
      position: { x: 2900, y: 1900 } // 灰谷位置
    },
    {
      id: 'razorfenkraul',
      name: { zh: '剃刀沼泽', en: 'Razorfen Kraul' },
      type: 'dungeon',
      level: '25-35',
      position: { x: 2600, y: 1400 } // 贫瘠之地位置
    },
    {
      id: 'razorfenkraul2',
      name: { zh: '剃刀高地', en: 'Razorfen Downs' },
      type: 'dungeon',
      level: '35-40',
      position: { x: 2550, y: 1350 } // 贫瘠之地位置
    },
    {
      id: 'maraudon',
      name: { zh: '玛拉顿', en: 'Maraudon' },
      type: 'dungeon',
      level: '40-50',
      position: { x: 2300, y: 2400 } // 凄凉之地位置
    },
    {
      id: 'zulfarrak',
      name: { zh: '祖尔法拉克', en: 'Zul\'Farrak' },
      type: 'dungeon',
      level: '45-50',
      position: { x: 1800, y: 2200 } // 塔纳利斯位置
    },
    {
      id: 'onyxialair',
      name: { zh: '奥妮克希亚的巢穴', en: 'Onyxia\'s Lair' },
      type: 'dungeon',
      level: '60',
      position: { x: 2700, y: 1200 } // 尘泥沼泽位置
    }
  ]
}

// 语言配置
export const languages = {
  zh: '简体中文',
  en: 'English'
}

export default {
  mapConfig,
  flightPoints,
  dungeons,
  languages
}