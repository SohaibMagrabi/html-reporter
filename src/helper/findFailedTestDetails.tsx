import { useGlobalContext } from '../hooks/GlobalContext';
import { IEnvironmentData, IFileStats, Status } from '../transform';

type FailedTest = {
  name: string;
  data: IEnvironmentData;
};

// TODO: Replace any with it's types
const findMaximumFailedEnv = (environments: Record<string, any>): FailedTest => {
  const [failedTests] = Object.entries(environments)
    .sort(([, a], [, b]) => {
      return b.stats.failed - a.stats.failed;
    })
    .reduce(
      (max, [name, data]) => {
        return data.stats.failed >= max[1]
          ? [
              {
                ...{ name: name },
                ...{ data: data }
              },
              data.stats.failed
            ]
          : [max[0], max[1]];
      },
      [{} as FailedTest, -Infinity]
    );

  return failedTests;
};

interface IFailedData {
  name: string;
  fileIndex: string;
  testIndex: string;
}

const findFailedTests = (file: IFileStats) => {
  const test = file.tests.find((test) => test.status === file.status && test.key);
  // we are returning the test so it would never be undefined
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return test!.key;
};

const createDataObject = (name: string, status: Status, files: IFileStats[]): IFailedData => {
  const data = {
    name
  } as IFailedData;

  data['fileIndex'] = `${status}-${0}`;
  data['testIndex'] = findFailedTests(files[0]);

  return data;
};

export const findFailedTestDetails = () => {
  const { environments } = useGlobalContext();
  const {
    name,
    data: {
      files: { pass, fail, skip }
    }
  } = findMaximumFailedEnv(environments);

  if (fail && fail.length > 0) {
    return createDataObject(name, 'fail', fail);
  } else if (skip && skip.length > 0) {
    return createDataObject(name, 'skip', skip);
  }
  return createDataObject(name, 'pass', pass);
};
