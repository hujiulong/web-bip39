import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Form,
  Button,
  Select,
  Input,
  Radio,
  Divider,
} from 'antd';
import 'antd/dist/antd.min.css';
import { GithubOutlined } from '@ant-design/icons';
import {
  mnemonicToSeed,
  generateMnemonic,
  validateMnemonic,
  mnemonicToEntropy,
  entropyToMnemonic,
} from '../src';
import english from '../src/wordlists/english.json';
import spanish from '../src/wordlists/spanish.json';
import french from '../src/wordlists/french.json';
import japanese from '../src/wordlists/japanese.json';
import italian from '../src/wordlists/italian.json';
import korean from '../src/wordlists/korean.json';
import portuguese from '../src/wordlists/portuguese.json';
import czech from '../src/wordlists/czech.json';
import chineseSimplified from '../src/wordlists/chinese-simplified.json';
import chineseTraditional from '../src/wordlists/chinese-traditional.json';


const languageToWordlist = {
  english,
  spanish,
  french,
  japanese,
  italian,
  korean,
  portuguese,
  czech,
  'chinese-simplified': chineseSimplified,
  'chinese-traditional': chineseTraditional,
};

const languageOptions = [
  {
    label: 'English',
    value: 'english'
  },
  {
    label: '中文(简体)',
    value: 'chinese-simplified'
  },
  {
    label: '中文(繁體)',
    value: 'chinese-traditional'
  },
  {
    label: '日本語',
    value: 'japanese'
  },
  {
    label: '한국어',
    value: 'korean'
  },
  {
    label: 'Français',
    value: 'french'
  },
  {
    label: 'Italiano',
    value: 'italian'
  },
  {
    label: 'Español',
    value: 'spanish'
  },
  {
    label: 'Português',
    value: 'portuguese'
  },
  {
    label: 'Čeština',
    value: 'czech'
  },
];


function bytesToHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, byte => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

const App = () => {
  const [form] = Form.useForm();
  const [language, setLanguage] = useState('english');
  const [length, setLength] = useState(12);
  const [seed, setSeed] = useState('');

  const wordlist = languageToWordlist[language];

  const handleGenerate = async () => {
    const strength = length / 3 * 32;
    const mnemonic = await generateMnemonic(wordlist, strength);
    form.setFieldsValue({ mnemonic });
    handleFormValuesChange();
  }

  const handleLanguageChange = async (
    oldLanguage: string,
    newLanguage: string,
  ) => {
    try {
      const values = await form.validateFields();
      const oldMnemonic = values.mnemonic;
      const entropy = await mnemonicToEntropy(oldMnemonic, languageToWordlist[oldLanguage]);
      const newMnemonic = await entropyToMnemonic(entropy, languageToWordlist[newLanguage]);
      form.setFieldsValue({ mnemonic: newMnemonic });
      handleFormValuesChange();
    } catch (e) {}
    setLanguage(newLanguage);
  }

  const handleFormValuesChange = async () => {
    try {
      // wait for form validation complete
      await new Promise(resolve => setTimeout(resolve, 0));
      const values = await form.validateFields();
      const { mnemonic, passphrase } = values;
      const seed = await mnemonicToSeed(mnemonic, passphrase);
      setSeed(bytesToHexString(seed));
    } catch (e) {
      setSeed('');
    }
  }

  return (
    <div
      style={{ width: '100%', maxWidth: 1000 }}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 12 }}
        style={{ width: '100%' }}
        onValuesChange={handleFormValuesChange}
      >
        <Form.Item
          wrapperCol={{
            sm: {
              offset: 6,
              span: 12,
            },
            xs: {
              offset: 0,
              span: 24,
            }
          }}
        >
          <h1 style={{ textAlign: 'center', margin: '40px 0' }}>Mnemonic Converter</h1>
          <p>
            You can enter an existing BIP39 mnemonic, or generate a new random one. Typing your own words will probably not work how you expect, since the words require a particular structure (the last word contains a checksum).
          </p>
          <p>
            For more info see the <a target="_blank" href="https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki">BIP39 spec</a>.
          </p>
          Generate a random mnemonic:
          <Button
            type="primary"
            onClick={handleGenerate}
            style={{ marginLeft: 12 }}
          >Generate</Button>
          <Select
            value={String(length)}
            onChange={value => setLength(Number(value))}
            style={{ width: 60, margin: '0 12px' }}
            options={[
              { value: '12' },
              { value: '15' },
              { value: '18' },
              { value: '21' },
              { value: '24' }
            ]}
          />
          words, or enter your own below.
        </Form.Item>
        <Form.Item
          label="Mnemonic Language"
        >
          <Radio.Group
            value={language}
            onChange={event => {
              handleLanguageChange(language, event.target.value);
            }}
            options={languageOptions}
          />
        </Form.Item>
        <Form.Item
          label="Mnemonic"
          name="mnemonic"
          rules={[
            {
              validator: async (_, value) => {
                if (!value) return;
                const valid = await validateMnemonic(value, wordlist);
                if (!valid) throw new Error('Invalid mnemonic');
              },
            }
          ]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label="Passphrase(optional)"
          name="passphrase"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="BIP39 Seed"
        >
          <Input.TextArea
            value={seed}
            disabled
            rows={3}
          />
        </Form.Item>
        <Divider />
        <Form.Item
          label="Install with NPM"
        >
          <code style={{
            backgroundColor: '#f6f8fa',
            padding: 12,
            borderRadius: 4,
          }}>npm install web-bip39 --save</code>
        </Form.Item>
        <Form.Item
          label="Source Code"
        >
          <Button
            icon={<GithubOutlined />}
            target="_blank"
            href="https://github.com/hujiulong/web-bip39"
          >
            View on GitHub
          </Button>
        </Form.Item>
      </Form>
      
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
