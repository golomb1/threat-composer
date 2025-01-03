/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 ******************************************************************************************************************** */
import { ExternalHyperlink, ImageRun, Paragraph } from 'docx';
import fetchImage from './fetchImage';

const getImage = async (imageUrl: string, defaultDir: boolean = false) => {
  const image = await fetchImage(imageUrl);

  if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
    return new Paragraph({
      bidirectional: defaultDir,
      children: [
        new ExternalHyperlink({
          link: imageUrl,
          children: [
            new ImageRun({
              data: image.image,
              transformation: {
                width: image.width,
                height: image.height,
              },
            }),
          ],
        }),
      ],
    });
  }

  return new Paragraph({
    children: [
      new ImageRun({
        data: image.image,
        transformation: {
          width: image.width,
          height: image.height,
        },
      }),
    ],
  });
};

export default getImage;