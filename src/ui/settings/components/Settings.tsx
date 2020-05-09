/**
 * Copyright (c) 2017-2020 Kenny Do and CAD Team (https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/graphs/contributors)
 * Licensed under MIT (https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/blob/3.X.X-Branch/LICENSE)
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { resetSettings, updateSetting } from '../../../redux/Actions';
import { initialState } from '../../../redux/State';
import { ReduxAction } from '../../../typings/ReduxConstants';
import CheckboxSetting from '../../common_components/CheckboxSetting';
import IconButton from '../../common_components/IconButton';
import { downloadObjectAsJSON } from '../../UILibs';
import SettingsTooltip from './SettingsTooltip';

const styles = {
  buttonStyle: {
    height: 'max-content',
    padding: '0.75em',
    width: 'max-content',
  },
  inlineNumberInput: {
    display: 'inline',
    margin: '0 5px',
  },
  rowOverrides: {
    marginBottom: '10px',
  },
};

interface OwnProps {
  style?: React.CSSProperties;
}

interface StateProps {
  settings: MapToSettingObject;
  browserDetect: string;
  browserVersion: string;
  platformOs: string;
}

interface DispatchProps {
  onUpdateSetting: (setting: Setting) => void;
  onResetButtonClick: () => void;
}

type SettingProps = OwnProps & StateProps & DispatchProps;

class InitialState {
  public error: string = '';
  public success: string = '';
}

class Settings extends React.Component<SettingProps> {
  public state = new InitialState();

  // Import Settings
  public importCoreSettings(files: Blob[]) {
    const { onUpdateSetting } = this.props;
    const initialSettingKeys = Object.keys(initialState.settings);
    const reader = new FileReader();
    reader.onload = file => {
      try {
        if (!file.target) throw Error('File Not Found!');
        // https://stackoverflow.com/questions/35789498/new-typescript-1-8-4-build-error-build-property-result-does-not-exist-on-t
        const target: any = file.target;
        const result: string = target.result;
        const newSettings: MapToSettingObject = JSON.parse(result);
        const settingKeys = Object.keys(newSettings);
        const unknownKeys = settingKeys.filter(key => !initialSettingKeys.includes(key));
        if (unknownKeys.length > 0) {
          throw new Error(`${browser.i18n.getMessage('importCoreSettingsFailed')}:  ${unknownKeys.join(', ')}`);
        }
        settingKeys.forEach(setting => onUpdateSetting(newSettings[setting]));
        this.setState({
          success: browser.i18n.getMessage('importCoreSettingsSuccess'),
        });
      } catch (error) {
        this.setState({
          error: error.toString(),
        });
      }
    }
    reader.readAsText(files[0]);
  }

  public render() {
    const { browserDetect, browserVersion, onResetButtonClick, onUpdateSetting, platformOs, settings, style, } = this.props;
    const { error, success } = this.state;
    return (
      <div style={style}>
        <h1>{browser.i18n.getMessage('settingsText')}</h1>
        <br />
        <div className="row">
          <div className="col-sm col-md-auto btn-group">
            <IconButton
              className="btn-primary"
              iconName="download"
              role="button"
              onClick={() => downloadObjectAsJSON(this.props.settings, 'CoreSettings')}
              title={browser.i18n.getMessage('exportTitleTimestamp')}
              text={browser.i18n.getMessage('exportSettingsText')}
              styleReact={styles.buttonStyle}
            />
            <IconButton
              tag="input"
              className="btn-info"
              iconName="upload"
              type="file"
              accept="text/json"
              onChange={e => this.importCoreSettings(e.target.files)}
              title={browser.i18n.getMessage('exportTitleTimestamp')}
              text={browser.i18n.getMessage('importCoreSettingsText')}
              styleReact={styles.buttonStyle}
            />
            <IconButton
              className="btn-danger"
              role="button"
              onClick={() => onResetButtonClick()}
              iconName="undo"
              text={browser.i18n.getMessage('defaultSettingsText')}
              styleReact={styles.buttonStyle}
            />
          </div>
        </div>
        <br />
        {error !== '' ? (
          <div
            onClick={() =>
              this.setState({
                error: '',
              })
            }
            className="row alert alert-danger"
          >
            {error}
          </div>
        ) : (
          ''
        )}
        {success !== '' ? (
          <div
            onClick={() =>
              this.setState({
                success: '',
              })
            }
            className="row alert alert-success"
          >
            {success}
          </div>
        ) : (
          ''
        )}

        <fieldset>
          <legend>{browser.i18n.getMessage('settingGroupAutoClean')}</legend>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('activeModeText')}
              inline={true}
              settingObject={settings.activeMode}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#enable-automatic-cleaning'}
            />
          </div>
          <div className="form-group">
            <input
              id="delayBeforeClean"
              type="number"
              className="form-control"
              style={styles.inlineNumberInput}
              onChange={e =>
                onUpdateSetting({
                  name: settings.delayBeforeClean.name,
                  value: e.target.value,
                })
              }
              value={settings.delayBeforeClean.value as number}
              min="1"
              max="2147483"
            />
            <label htmlFor="delayBeforeClean">{browser.i18n.getMessage('secondsText')} {browser.i18n.getMessage('activeModeDelayText')}</label>
            <SettingsTooltip
              hrefURL={'#delay-before-automatic-cleaning'}
            />
          </div>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('cleanupDomainChangeText')}
              settingObject={settings.domainChangeCleanup}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#enable-cleanup-on-domain-change'}
            />
          </div>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('enableGreyListCleanup')}
              settingObject={settings.enableGreyListCleanup}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#enable-greylist-cleanup-on-browser-restart'}
            />
          </div>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('cookieCleanUpOnStartText')}
              settingObject={settings.cleanCookiesFromOpenTabsOnStartup}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#clean-cookies-from-open-tabs-on-startup'}
            />
          </div>
        </fieldset>
        <fieldset>
          <legend>{browser.i18n.getMessage('settingGroupExpression')}</legend>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('greyCleanLocalstorage')}
              settingObject={settings.greyCleanLocalstorage}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#uncheck-keep-localstorage-on-new-greylist-expressions'}
            />
          </div>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('whiteCleanLocalstorage')}
              settingObject={settings.whiteCleanLocalstorage}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#uncheck-keep-localstorage-on-new-whitelist-expressions'}
            />
          </div>
        </fieldset>
        <fieldset>
          <legend>{browser.i18n.getMessage('settingGroupOtherBrowsing')}</legend>
          {browserDetect === 'Firefox' && platformOs !== 'android' && (
            <div className="form-group">
              <CheckboxSetting
                text={browser.i18n.getMessage('contextualIdentitiesEnabledText')}
                settingObject={settings.contextualIdentities}
                inline={true}
                updateSetting={payload => onUpdateSetting(payload)}
              />
              <SettingsTooltip
                hrefURL={'#enable-support-for-firefoxs-container-tabs-firefox-only'}
              />
            </div>
          )}
          {((browserDetect === 'Firefox' &&
            browserVersion >= '58' &&
            platformOs !== 'android') ||
            browserDetect === 'Chrome') && (
            <div className="form-group">
              <CheckboxSetting
                text={`${browser.i18n.getMessage('localstorageCleanupText')} (Firefox 58+, Chrome 74+)`}
                settingObject={settings.localstorageCleanup}
                inline={true}
                updateSetting={payload => onUpdateSetting(payload)}
              />
              <SettingsTooltip
                hrefURL={'#enable-localstorage-support'}
              />
              {!settings.localstorageCleanup.value && (
                <div className="alert alert-warning">
                  {browser.i18n.getMessage('localstorageCleanupWarning',)}
                </div>
              )}
              {settings.contextualIdentities.value &&
                settings.localstorageCleanup.value && (
                <div className="alert alert-warning">
                  {browser.i18n.getMessage(
                    'localstorageAndContextualIdentitiesWarning',
                  )}
                </div>
              )}
            </div>
          )}
        </fieldset>
        <fieldset>
          <legend>{browser.i18n.getMessage('settingGroupExtension')}</legend>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('enableCleanupLogText')}
              settingObject={settings.statLogging}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#enable-cleanup-log-and-counter'}
            />
            {settings.statLogging.value && (
              <div className="alert alert-warning">
                {browser.i18n.getMessage('noPrivateLogging')}
              </div>
            )}
          </div>
          {(browserDetect !== 'Firefox' || platformOs !== 'android') && (
            <div className="form-group">
              <CheckboxSetting
                text={browser.i18n.getMessage('showNumberOfCookiesInIconText')}
                settingObject={settings.showNumOfCookiesInIcon}
                inline={true}
                updateSetting={payload => onUpdateSetting(payload)}
              />
              <SettingsTooltip
                hrefURL={'#show-number-of-cookies-for-that-domain'}
              />
            </div>

          )}
          {((browserDetect !== 'Firefox' || platformOs !== 'android') && settings.showNumOfCookiesInIcon.value === true) && (
            <div className="form-group">
              <CheckboxSetting
                text={browser.i18n.getMessage('keepDefaultIcon')}
                settingObject={settings.keepDefaultIcon}
                inline={true}
                updateSetting={payload => onUpdateSetting(payload)}
              />
              <SettingsTooltip
                hrefURL={'#keep-default-icon'}
              />
            </div>
          )}
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('notifyCookieCleanUpText')}
              settingObject={settings.showNotificationAfterCleanup}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#show-notification-after-cookie-cleanup'}
            />
          </div>
          <div className="form-group">
            <input
              id="notificationOnScreen"
              type="number"
              className="form-control"
              style={styles.inlineNumberInput}
              onChange={e =>
                onUpdateSetting({
                  name: settings.notificationOnScreen.name,
                  value: e.target.value,
                })
              }
              value={settings.notificationOnScreen.value as number}
              min="1"
              max="5"
            />
            <label htmlFor="notificationOnScreen">{browser.i18n.getMessage('secondsText')} {browser.i18n.getMessage('notifyCookieCleanupDelayText')}</label>
            <SettingsTooltip
              hrefURL={'#show-notification-after-cookie-cleanup'}
            />
          </div>
          <div className="form-group">
            <CheckboxSetting
              text={browser.i18n.getMessage('enableNewVersionPopup')}
              settingObject={settings.enableNewVersionPopup}
              inline={true}
              updateSetting={payload => onUpdateSetting(payload)}
            />
            <SettingsTooltip
              hrefURL={'#enable-popup-when-new-version-is-released'}
            />
          </div>
          {((browserDetect === 'Firefox' && platformOs !== 'android') ||
            browserDetect === 'Chrome') && (
            <div className="form-group">
              <CheckboxSetting
                text={browser.i18n.getMessage('debugMode')}
                settingObject={settings.debugMode}
                inline={true}
                updateSetting={payload => onUpdateSetting(payload)}
              />
              <SettingsTooltip
                hrefURL={'#debug-mode'}
              />
              {settings.debugMode.value && (
                <div className="alert alert-info">
                  <p>{browser.i18n.getMessage('openDebugMode')}</p>
                  <pre><b>{(browserDetect === 'Firefox') && 'about:devtools-toolbox?type=extension&id='  || (browserDetect === 'Chrome') && `chrome://extensions/?id=`}{encodeURIComponent(browser.runtime.id)}</b></pre>
                  {(browserDetect === 'Chrome') && <p>{browser.i18n.getMessage('chromeDebugMode')}</p>}
                  <p>{browser.i18n.getMessage('consoleDebugMode')}.  {browser.i18n.getMessage('filterDebugMode')} <b>CAD_</b></p>
                </div>
              )}
            </div>
          )}
        </fieldset>
        <br />
        <br />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => {
  const { settings, cache } = state;
  return {
    browserDetect: cache.browserDetect,
    browserVersion: cache.browserVersion,
    platformOs: cache.platformOs,
    settings,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ReduxAction>) => ({
  onUpdateSetting(newSetting: Setting) {
    dispatch(updateSetting(newSetting));
  },
  onResetButtonClick() {
    dispatch(resetSettings());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Settings);
