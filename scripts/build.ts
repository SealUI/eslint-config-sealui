import * as fs from 'fs';
import * as path from 'path';

import * as doctrine from 'doctrine';
import * as prettier from 'prettier';

// eslint-disable-next-line @typescript-eslint/no-var-requires

type RuleNamespaces = 'index' | 'react' | 'vue' | 'typescript';

const RuleCategoryPriority = {
  'Possible Errors': 0,
  'Best Practices': 1,
  'Strict Mode': 2,
  Variables: 3,
  'Node.js and CommonJS': 4,
  'Stylistic Issues': 5,
  'ECMAScript 6': 6,
  React: 10,
  'JSX-specific': 11,
  'Enabling Correct ESLint Parsing': 20,
  'Error Prevention': 21,
  'Improving Readability': 22,
  'Minimizing Arbitrary Choices and Cognitive Overhead': 23,
  Uncategorized: 24,
  TypeScript: 30,
  '': 99
};

type RuleCategory = keyof typeof RuleCategoryPriority;

interface Rule {
  name: string;
  value: any;
  description: string;
  category: RuleCategory;
  reason?: string;
  fixable?: boolean;
  comments: string;
  [key: string]: string | boolean | undefined;
}

// interface RuleMap {
//     [key: string]: Rule;
// }

class Builder {
  private namespace: RuleNamespaces = 'index';
  private ruleList: Rule[] = [];
  // private ruleMap: RuleMap = {};
  private rulesContent: string = '';
  private namespaceEslintrcContent: string = '';

  public build(namespace: RuleNamespaces) {
    this.namespace = namespace;
    this.ruleList = this.getRuleList();
    // this.ruleMap = this.getRuleMap();
    this.rulesContent = this.getRulesContent();
    this.namespaceEslintrcContent = this.getNamespaceEslintrc();
    // this.buildRulesJson();
    if (this.namespace === 'index') {
      this.buildIndexEslintrc();
    } else {
      this.buildNamespaceEslintrc();
    }
  }

  private buildIndexEslintrc() {
    const eslintrcContent =
      // this.buildEslintrcMeta() +
      `module.exports={extends:['./base.js'],rules:{${this.rulesContent}}};`;

    this.writeWithPrettier(path.resolve(__dirname, '../lib/index.js'), eslintrcContent);
  }

  private buildNamespaceEslintrc() {
    const eslintrcContent =
      // this.buildEslintrcMeta() +
      this.namespaceEslintrcContent
        .replace(/extends:.*]/, "extends: ['./index.js']")
        .replace('};', `,rules:{${this.rulesContent}}};`);
    this.writeWithPrettier(path.resolve(__dirname, `../lib/${this.namespace}.js`), eslintrcContent);
  }

  /**
   * 获取规则列表，根据分类和字母排序
   */
  private getRuleList() {
    const ruleList = fs
      .readdirSync(path.resolve(__dirname, '../test', this.namespace))
      .filter((ruleName) =>
        fs.lstatSync(path.resolve(__dirname, '../test', this.namespace, ruleName)).isDirectory()
      )
      .map((ruleName) => {
        const filePath = path.resolve(
          __dirname,
          '../test',
          this.namespace,
          ruleName,
          '.eslintrc.js'
        );
        return this.getRule(filePath);
      })
      .sort((aRule, bRule) => {
        const aRuleCategory = aRule.category;
        const bRuleCategory = bRule.category;

        if (RuleCategoryPriority[aRuleCategory] > RuleCategoryPriority[bRuleCategory]) {
          return 1;
        }
        if (RuleCategoryPriority[aRuleCategory] < RuleCategoryPriority[bRuleCategory]) {
          return -1;
        }
        return aRule.name > bRule.name ? 1 : -1;
      });

    return ruleList;
  }

  private writeWithPrettier(filePath: string, content: string) {
    fs.writeFileSync(
      filePath,
      // 使用 prettier 格式化文件内容
      prettier.format(content, {
        ...require('../prettier.config'),
        parser: 'babel'
      }),
      'utf-8'
    );
  }

  private getRule(filePath: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fileModule = require(filePath);
    const ruleName = Object.keys(fileModule.rules)[0];
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const comments = /\/\*\*.*\*\//gms.exec(fileContent);
    let rule: Rule = {
      name: ruleName,
      value: fileModule.rules[ruleName],
      description: '',
      category: '',
      comments: ''
    };
    if (comments !== null) {
      const commentsAST = doctrine.parse(comments[0], { unwrap: true });
      rule.description = commentsAST.description;
      commentsAST.tags.forEach(({ title, description }) => {
        rule[title] = description === null ? true : description;
      });
      rule.comments = comments[0];
    }
    return rule;
  }

  // private getRuleMap() {
  //     return this.ruleList.reduce<RuleMap>((prev, rule) => {
  //         prev[rule.name] = rule;
  //         return prev;
  //     }, {});
  // }

  private getNamespaceEslintrc() {
    const namespaceEslintrcPath = path.resolve(__dirname, `../test/${this.namespace}/.eslintrc.js`);
    if (!fs.existsSync(namespaceEslintrcPath)) {
      return '';
    }
    return fs.readFileSync(namespaceEslintrcPath, 'utf-8');
  }

  private getRulesContent() {
    return this.ruleList
      .map((rule) => `\n${rule.comments}\n'${rule.name}': ${JSON.stringify(rule.value, null, 4)},`)
      .join('');
  }
}

const builder = new Builder();
builder.build('index');
builder.build('react');
builder.build('vue');
builder.build('typescript');
