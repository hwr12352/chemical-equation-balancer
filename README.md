# ChemEquilibrium_化学方程式智能配平

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

## 项目简介

ChemEquilibrium 是一个基于**线性代数（高斯消元法）** 的化学方程式自动配平工具。它能够解析复杂化学式（含括号、水合物、系数前缀），构建原子守恒齐次线性方程组，并通过**自由变量赋值 + 最小公倍数归一化**输出最简整数系数。

本项目源于对化学计量学中矩阵方法的研究，旨在将数学理论应用于实际科学问题，体现了计算思维与跨学科融合的能力。

## 核心特性

- **鲁棒的化学式解析器**：支持 `()` 嵌套、水合物中间点 `·` 以及前缀系数（如 `2H2O`）。
- **高斯-约当消元法求解**：精确处理欠定方程组，自动选择最小正整数解。
- **最简整数比输出**：通过最大公约数（GCD）与最小公倍数（LCM）算法将系数化简。
- **可选的 Web 交互界面**：提供基于 Node.js 的 HTTP 服务与毛玻璃风格前端（见 `public/`）。
- **模块化设计**：核心算法与界面解耦，便于集成或命令行调用。
- **单元测试覆盖**：使用 Jest 验证典型反应及边界情况。

## 算法原理简述

1. **化学式解析**：采用递归下降法解析字符串，统计各元素原子个数。
2. **构建矩阵**：对于反应 $\sum a_i R_i = \sum b_j P_j$，建立元素守恒方程：
   $$\sum_i a_i \cdot \text{count}_{i,e} - \sum_j b_j \cdot \text{count}_{j,e} = 0 \quad \forall e \in \text{Elements}$$
3. **高斯消元**：将增广矩阵化为行最简形，识别自由变量并赋值为 1，得到基础解系。
4. **有理数转整数**：将浮点数解转换为分数，求所有分母的最小公倍数并缩放，最后除以系数的最大公约数得到最简整数比。

## By广东肇庆中学 261015 黄炜睿

## 📦 安装与使用

### 环境要求
- Node.js >= 14.0.0

### 克隆仓库
```bash
git clone https://github.com/hwr12352/chemical-equation-balancer.git
cd chem-balancergit init
npm install