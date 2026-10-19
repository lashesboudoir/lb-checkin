/*! Lashes Boudoir iPad check-in gas-1.3.0 — serverless edition (Squarespace / static host + Google Apps Script).
 *  Includes qrcode-generator 2.0.4 (c) 2009 Kazuhiko Arase, MIT licence. */
(function () {
'use strict';
if (window.__LB_CHECKIN__) { try { window.__LB_CHECKIN__.mount(); } catch (e) {} return; }   // loaded twice (AJAX page loads): just re-mount
const LB_VERSION = "gas-1.3.0";
const LB_QR = (function () { var define, exports, module; //---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));

return qrcode; })();
// Client-facing UI strings. Consent wording comes from /api/content/{lang}.
var I18N = {
  en: {
    welcome: "Welcome", choose_lang: "Please choose your language",
    step: "Step", of: "of", back: "Back", next: "Continue", submit: "Sign & submit", finish: "Done",
    s1_title: "Your details", s1_sub: "We need these details to look after you safely, keep a record of your signed consent, and send your photos.", s1_sub_np: "We need these details to look after you safely and keep a record of your signed consent.", email_hint_np: "Optional. Add it if you'd like news and offers from us.", pref_np: "How should we contact you?",
    first_name: "First name", last_name: "Last name", dob: "Date of birth",
    day: "Day", month: "Month", year: "Year",
    phone: "Mobile number", phone_ph: "081 234 5678",
    email: "Email", email_hint: "Optional, but recommended — if you don't add us on LINE or WhatsApp, we email your photos.",
    pref: "How should we send your photos?",
    s2_title: "Today's service & allergy history",
    other_ph: "Please describe", s3_title: "Information & consent",
    s3_sub: "Please read each section. Tap a heading to open it.",
    date_label: "Date", sign_here: "Sign here with your finger", clear: "Clear",
    s4_title: "Photos & privacy", required_tag: "Required",
    see_example: "See an example", about_style: "What's the difference?", example_caption: "Your personalised before & after set, sent the same evening.",
    add_title: "Add us to receive your photos",
    add_sub: "Your personal codes — we'll send your before & after photos privately.",
    add_scan: "Scan → tap Send — that's it",
    add_scan_sub: "Your phone opens the chat with your message ready. On LINE, if we're not friends yet, tap Add first, then Send.",
    add_line_sub: "Scan, add us, then tap Send", add_wa_sub: "Scan, then tap Send",
    add_line_manual: "Scan to add us, then send the message below",
    add_msg_label: "Your message", add_loading: "Preparing your codes…",
    add_email_note: "Prefer not to add us? No problem — we'll send your photos by email instead.",
    add_email_missing: "Add us on LINE or WhatsApp, or ask us to add your email, so we can send your photos.",
    thank_you: "Thank you", thank_sub: "Please hand the iPad back to our team. Enjoy your treatment.",
    e_required: "Required", e_name: "Please enter your name", e_dob: "Please choose a valid date of birth",
    e_phone: "Please check your mobile number", e_email: "Please check your email address",
    e_email_pref: "Please enter your email to receive photos by email", e_email_pref_np: "Please enter your email, or choose LINE or WhatsApp", e_email_mkt: "Please add your email to receive news and offers.",
    e_service: "Please choose at least one service", e_other: "Please describe the service",
    e_allergy: "Please choose at least one option (or 'None known')", e_prev: "Please answer Yes or No",
    e_confirm: "Please tick both confirmations", e_sig: "Please sign", e_photo: "This consent is required to take your photos",
    e_fix: "Please check the highlighted fields", sending: "Saving…", saved_err: "Could not save. Please ask our team.",
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    kind_before: "Before", kind_after: "After",
  },
  th: {
    welcome: "ยินดีต้อนรับ", choose_lang: "กรุณาเลือกภาษา",
    step: "ขั้นตอน", of: "จาก", back: "ย้อนกลับ", next: "ถัดไป", submit: "ลงนามและส่ง", finish: "เสร็จสิ้น",
    s1_title: "ข้อมูลของคุณ", s1_sub: "เราต้องใช้ข้อมูลนี้เพื่อดูแลคุณอย่างปลอดภัย เก็บบันทึกการยินยอมที่คุณลงนาม และส่งภาพถ่ายให้คุณ", s1_sub_np: "เราต้องใช้ข้อมูลนี้เพื่อดูแลคุณอย่างปลอดภัย และเก็บบันทึกการยินยอมที่คุณลงนาม", email_hint_np: "ไม่บังคับ กรอกไว้หากต้องการรับข่าวสารและข้อเสนอจากเรา", pref_np: "ต้องการให้เราติดต่อทางช่องทางใด",
    first_name: "ชื่อ", last_name: "นามสกุล", dob: "วันเกิด",
    day: "วัน", month: "เดือน", year: "ปี (พ.ศ.)",
    phone: "เบอร์โทรศัพท์มือถือ", phone_ph: "081 234 5678",
    email: "อีเมล", email_hint: "ไม่บังคับ แต่แนะนำ — หากคุณไม่ได้เพิ่มเราใน LINE หรือ WhatsApp เราจะส่งภาพทางอีเมล",
    pref: "ต้องการรับภาพทางช่องทางใด",
    s2_title: "บริการวันนี้และประวัติการแพ้",
    other_ph: "โปรดระบุ", s3_title: "ข้อมูลและความยินยอม",
    s3_sub: "โปรดอ่านแต่ละหัวข้อ แตะที่หัวข้อเพื่อเปิดอ่าน",
    date_label: "วันที่", sign_here: "เซ็นชื่อด้วยนิ้วของคุณที่นี่", clear: "ล้าง",
    s4_title: "รูปภาพและความเป็นส่วนตัว", required_tag: "จำเป็น",
    see_example: "ดูตัวอย่าง", about_style: "ต่างกันอย่างไร?", example_caption: "ชุดภาพก่อนและหลังเฉพาะของคุณ ส่งให้ภายในเย็นวันเดียวกัน",
    add_title: "เพิ่มเราเป็นเพื่อนเพื่อรับภาพของคุณ",
    add_sub: "คิวอาร์โค้ดเฉพาะของคุณ — เราจะส่งภาพก่อนและหลังให้คุณเป็นการส่วนตัว",
    add_scan: "สแกน → กดส่ง — เท่านี้เอง",
    add_scan_sub: "โทรศัพท์จะเปิดแชทพร้อมข้อความให้แล้ว สำหรับ LINE หากยังไม่ได้เป็นเพื่อนกับเรา กดเพิ่มเพื่อนก่อน แล้วกดส่ง",
    add_line_sub: "สแกน เพิ่มเพื่อน แล้วกดส่ง", add_wa_sub: "สแกน แล้วกดส่ง",
    add_line_manual: "สแกนเพื่อเพิ่มเพื่อน แล้วส่งข้อความด้านล่าง",
    add_msg_label: "ข้อความของคุณ", add_loading: "กำลังเตรียมคิวอาร์โค้ดของคุณ…",
    add_email_note: "ไม่สะดวกเพิ่มเพื่อน? ไม่เป็นไร เราจะส่งภาพให้ทางอีเมลแทน",
    add_email_missing: "กรุณาเพิ่มเราใน LINE หรือ WhatsApp หรือแจ้งอีเมลกับพนักงาน เพื่อให้เราส่งภาพให้คุณได้",
    thank_you: "ขอบคุณค่ะ", thank_sub: "กรุณาส่ง iPad คืนให้พนักงาน ขอให้เพลิดเพลินกับบริการ",
    e_required: "จำเป็นต้องกรอก", e_name: "กรุณากรอกชื่อ", e_dob: "กรุณาเลือกวันเกิดที่ถูกต้อง",
    e_phone: "กรุณาตรวจสอบเบอร์โทรศัพท์", e_email: "กรุณาตรวจสอบอีเมล",
    e_email_pref: "กรุณากรอกอีเมลเพื่อรับภาพทางอีเมล", e_email_pref_np: "กรุณากรอกอีเมล หรือเลือก LINE หรือ WhatsApp", e_email_mkt: "กรุณากรอกอีเมลเพื่อรับข่าวสารและข้อเสนอ",
    e_service: "กรุณาเลือกบริการอย่างน้อยหนึ่งรายการ", e_other: "กรุณาระบุบริการ",
    e_allergy: "กรุณาเลือกอย่างน้อยหนึ่งข้อ (หรือ 'ไม่เคยมีประวัติที่ทราบ')", e_prev: "กรุณาเลือก เคย หรือ ไม่เคย",
    e_confirm: "กรุณาทำเครื่องหมายยืนยันทั้งสองข้อ", e_sig: "กรุณาลงลายมือชื่อ", e_photo: "จำเป็นต้องให้ความยินยอมนี้เพื่อถ่ายภาพ",
    e_fix: "กรุณาตรวจสอบช่องที่ไฮไลต์", sending: "กำลังบันทึก…", saved_err: "บันทึกไม่สำเร็จ กรุณาแจ้งพนักงาน",
    months: ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],
    kind_before: "ก่อนทำ", kind_after: "หลังทำ",
  }
};

const LB_DATA = {"branches": {"asoke": {"en": "Asoke", "th": "อโศก", "city_en": "Bangkok", "city_th": "กรุงเทพฯ"}, "ploenchit": {"en": "Ploenchit", "th": "เพลินจิต", "city_en": "Bangkok", "city_th": "กรุงเทพฯ"}, "jomtien": {"en": "Jomtien", "th": "จอมเทียน", "city_en": "Pattaya", "city_th": "พัทยา"}}, "services": [{"id": "lash_ext", "en": "Lash Extensions", "th": "ต่อขนตา"}, {"id": "lash_lift", "en": "Lash Lift", "th": "ลิฟต์ขนตา"}, {"id": "brow_lam", "en": "Brow Lamination", "th": "ลามิเนตคิ้ว"}, {"id": "tint", "en": "Brow/Lash Tint or Hybrid Dye", "th": "ทินท์คิ้ว/ขนตา หรือไฮบริดดาย"}, {"id": "bleach", "en": "Brow Bleaching", "th": "ฟอกสีคิ้ว"}, {"id": "wax_thread", "en": "Waxing/Threading", "th": "แว็กซ์/ถอนด้วยเส้นด้าย"}, {"id": "facial_spa", "en": "Facial/Spa", "th": "ทรีตเมนต์หน้า/สปา"}, {"id": "other", "en": "Other", "th": "อื่น ๆ"}], "allergy_items": [{"id": "eye_pads", "en": "Hydrogel eye pads / under-eye patches", "th": "แผ่นเจลใต้ตา"}, {"id": "tape", "en": "Medical tape, plasters or adhesive tape", "th": "เทป พลาสเตอร์ หรือผลิตภัณฑ์กาว"}, {"id": "adhesive", "en": "Lash extension adhesive", "th": "กาวต่อขนตา"}, {"id": "lift_lam", "en": "Lash lift or brow lamination products", "th": "ผลิตภัณฑ์ลิฟต์ขนตาหรือลามิเนตคิ้ว"}, {"id": "dye", "en": "Lash/brow tint, hybrid dye or hair dye", "th": "สีทาขนตา คิ้ว ไฮบริดดาย หรือยาย้อมผม"}, {"id": "bleach", "en": "Bleach/developer", "th": "ผลิตภัณฑ์ฟอกสีหรือออกซิแดนท์"}, {"id": "wax_skin", "en": "Wax/skincare/cosmetics", "th": "แว็กซ์ สกินแคร์ หรือเครื่องสำอาง"}, {"id": "sensitive", "en": "Sensitive skin, eczema or dermatitis", "th": "ผิวแพ้ง่าย เอ็กซีมา หรือผิวหนังอักเสบ"}, {"id": "none", "en": "None known", "th": "ไม่เคยมีประวัติที่ทราบ"}], "photo_skip_reasons": {"busy": "Busy", "late": "Client running late", "difficult": "Difficult result expected", "other": "Other", "staff": "Staff: no photos"}, "consent_version": "allergy-consent-v1.1-2026-10", "content": {"en": {"consent": {"title": "Allergy, Sensitivity & Skin Reaction Consent", "client_name": "Client Name", "date": "Date", "branch": "Branch", "dob": "Date of birth", "phone": "Phone", "email": "Email", "service_today": "Service today", "history_title": "Allergy & Sensitivity History", "history_intro": "Please inform your technician of any previous allergy, sensitivity, irritation, swelling, rash, burning or unusual reaction to cosmetics or beauty treatments.", "prev_q": "Have you ever experienced redness or irritation from under-eye patches, facial masks, medical tape or plasters?", "yes": "Yes", "no": "No", "known_label": "Known allergies / previous reactions", "sections": [{"title": "1. Eye Pads & Tapes", "body": "Under-eye pads and/or tapes are used during lash services to isolate and protect the lower lashes. They contact the delicate under-eye area and may contain hydrogel, adhesive components, humectants, botanical extracts, skincare ingredients or other materials. Individual sensitivity may cause redness, irritation, itching, swelling or other localized reactions. Mechanical pressure, friction, or removal may also cause temporary redness or visible small blood vessels in delicate skin."}, {"title": "2. Lash Extension Adhesive", "body": "Lash extension adhesives commonly contain cyanoacrylate-based ingredients. Some individuals may develop irritation or sensitivity to adhesive or its fumes, including redness, itching, watering, burning or swelling around the eye area."}, {"title": "3. Lash Lift & Brow Lamination", "body": "Lifting and setting solutions chemically alter the hair structure and may cause irritation or sensitivity in some individuals."}, {"title": "4. Tint, Hybrid Dye & Bleaching", "body": "Dyes, pigments, oxidants/developers and bleaching agents may cause irritation or allergic reactions. Clients with previous reactions to hair dye, brow/lash tint or bleach must inform the technician before treatment."}, {"title": "5. Other Skin-Contact Services", "body": "Waxing, threading, facial and spa services may cause temporary redness or irritation from products, friction, heat or mechanical contact."}], "important_title": "Important Information", "important": ["Individual sensitivity varies. A reaction may occur even if similar products were previously used without a problem.", "Reactions cannot always be predicted in advance. A patch test may help assess sensitivity but cannot guarantee that no reaction will occur.", "I will immediately inform my technician if I experience unusual burning, stinging, itching or discomfort during treatment.", "If I have a known allergy or significant previous reaction, Lashes Boudoir may modify, postpone or decline the service and/or recommend an appropriate patch test."], "declaration_title": "Client Declaration & Consent", "declaration": "I confirm that the information I have provided regarding my known allergies, sensitivities, previous reactions and relevant skin conditions is accurate to the best of my knowledge. I understand that it is my responsibility to disclose any known allergy, sensitivity, previous reaction or relevant skin condition before treatment. If I knowingly fail to disclose such information, I understand that Lashes Boudoir cannot be held responsible for a reaction resulting from the undisclosed condition or sensitivity. I understand the products and potential reactions associated with my selected service, have had the opportunity to ask questions, and consent to proceed.", "confirm_declaration": "I have read and agree to the Client Declaration & Consent above.", "confirm_disclosed": "I confirm that I have disclosed all known allergies, sensitivities and previous reactions to my technician.", "signature": "Client Signature", "footer": "If a severe or worsening reaction occurs, seek appropriate medical care."}, "photo": {"title": "Your photos", "required": "I agree that Lashes Boudoir will take before and after photos of my treatment and send them privately to me.", "promo": "Lashes Boudoir may use my photos for promotion (website, social media). (Optional)", "promo_hint": "Optional. You can say no and still receive your photos. You can withdraw at any time.", "style_title": "Photo style", "style_natural": "Natural", "style_soft": "Soft retouch", "style_light": "Light retouch", "style_natural_desc": "Exactly as taken. No editing.", "style_soft_desc": "Very gentle skin smoothing.", "style_light_desc": "Light skin smoothing, more even tone.", "style_info": "Natural photos are sent exactly as taken (colour and light balanced only). Soft retouch very gently softens skin texture; light retouch smooths skin a little more and evens out tone and small blemishes. With every option your lashes, brows and lips are never edited, so the result of your treatment is shown honestly.", "pdpa_title": "Privacy notice (PDPA)", "pdpa": "Lashes Boudoir collects your name, date of birth, contact details, treatment and allergy information, signature and treatment photos. We use them to provide your service, keep your client record (including age verification), and send your before/after photos to you privately. We keep this data only for a limited time; raw photos are deleted after a set period unless you have agreed to promotional use. If you opt in, we also use your email to send you news and offers; you can unsubscribe at any time. You may ask to see, correct or delete your data, or withdraw consent, at any time by contacting us at the salon or via LINE, WhatsApp or email (hello@lashesboudoir.com)."}, "nophoto": {"title": "Privacy", "pdpa_title": "Privacy notice (PDPA)", "pdpa": "Lashes Boudoir collects your name, date of birth, contact details, treatment and allergy information and signature. We use them to provide your service and keep your client record (including age verification). We keep this data only for a limited time. If you opt in, we also use your email to send you news and offers; you can unsubscribe at any time. You may ask to see, correct or delete your data, or withdraw consent, at any time by contacting us at the salon or via LINE, WhatsApp or email (hello@lashesboudoir.com)."}, "marketing": {"label": "Send me Lashes Boudoir news and offers by email. (Optional)", "hint": "You can unsubscribe at any time."}, "forms": {"visit_first": "First visit", "visit_returning": "Returning client", "form_waiver": "Allergy & health waiver", "form_photo": "Photo consent", "forms_signed": "Forms signed this visit", "health_q": "Any changes to your health, allergies or medication since your last visit?", "health_yes": "Yes", "health_no": "No", "health_yes_note": "Thank you. Please complete the allergy and health questions below.", "health_answer_no": "Client confirmed: no changes to health, allergies or medication since the last visit.", "health_answer_yes": "Client reported changes since the last visit; the full allergy & health waiver was completed.", "service_title": "Today's service", "photosign_sub": "Please read, tick and sign below.", "e_health": "Please answer Yes or No", "form_health": "Health declaration", "healthsign_title": "Health declaration", "healthsign_sub": "Please check the statement below and sign.", "healthsign_text": "I confirm that there have been no changes to my health, allergies or medication since my last visit, and that I have told the staff about anything that could affect today's treatment."}}, "th": {"consent": {"title": "แบบยินยอมเกี่ยวกับการแพ้ การระคายเคือง และปฏิกิริยาทางผิวหนัง", "client_name": "ชื่อลูกค้า", "date": "วันที่", "branch": "สาขา", "dob": "วันเกิด", "phone": "โทรศัพท์", "email": "อีเมล", "service_today": "บริการวันนี้", "history_title": "ประวัติการแพ้และการระคายเคือง", "history_intro": "โปรดแจ้งพนักงาน หากเคยมีอาการแพ้ ระคายเคือง บวม ผื่น แสบ หรือปฏิกิริยาผิดปกติจากเครื่องสำอางหรือบริการความงาม", "prev_q": "เคยมีอาการแดงหรือระคายเคืองจากแผ่นใต้ตา มาสก์หน้า เทปทางการแพทย์ หรือพลาสเตอร์หรือไม่?", "yes": "เคย", "no": "ไม่เคย", "known_label": "รายละเอียดการแพ้หรือปฏิกิริยาที่เคยเกิดขึ้น", "sections": [{"title": "1. แผ่นเจลใต้ตาและเทป", "body": "แผ่นเจลใต้ตาและ/หรือเทปใช้ระหว่างบริการขนตาเพื่อแยกและปกป้องขนตาล่าง โดยสัมผัสโดยตรงกับผิวใต้ตาที่บอบบาง และอาจมีส่วนประกอบของไฮโดรเจล สารยึดเกาะ สารให้ความชุ่มชื้น สารสกัดจากพืช สารบำรุงผิว หรือส่วนประกอบอื่น ลูกค้าแต่ละรายอาจเกิดอาการแดง ระคายเคือง คัน บวม หรือปฏิกิริยาเฉพาะบริเวณได้ นอกจากนี้แรงกด การเสียดสี หรือการลอกแผ่น/เทปออก อาจทำให้เกิดรอยแดงชั่วคราวหรือเห็นเส้นเลือดเล็ก ๆ ชัดขึ้นในผิวที่บอบบาง"}, {"title": "2. กาวต่อขนตา", "body": "กาวต่อขนตาโดยทั่วไปมีสารกลุ่ม cyanoacrylate ซึ่งในบางรายอาจทำให้เกิดการระคายเคืองหรือแพ้จากตัวกาวหรือไอระเหย เช่น แดง คัน น้ำตาไหล แสบ หรือบวมบริเวณรอบดวงตา"}, {"title": "3. ลิฟต์ขนตาและลามิเนตคิ้ว", "body": "น้ำยาดัดและเซ็ตมีสารเคมีที่เปลี่ยนโครงสร้างเส้นขน และอาจก่อให้เกิดการระคายเคืองหรือแพ้ในบางราย"}, {"title": "4. ทินท์ ไฮบริดดาย และฟอกสี", "body": "สี เม็ดสี ออกซิแดนท์/ดีเวลลอปเปอร์ และสารฟอกสีอาจทำให้ระคายเคืองหรือเกิดอาการแพ้ ผู้ที่เคยมีปฏิกิริยาจากยาย้อมผม สีคิ้ว/ขนตา หรือผลิตภัณฑ์ฟอกสี ต้องแจ้งพนักงานก่อนรับบริการ"}, {"title": "5. บริการอื่นที่สัมผัสผิว", "body": "บริการแว็กซ์ ถอนด้วยเส้นด้าย ทรีตเมนต์หน้าและสปา อาจทำให้เกิดรอยแดงหรือระคายเคืองชั่วคราวจากผลิตภัณฑ์ การเสียดสี ความร้อน หรือแรงสัมผัส"}], "important_title": "ข้อมูลสำคัญ", "important": ["การตอบสนองของแต่ละบุคคลแตกต่างกัน และอาจเกิดปฏิกิริยาได้แม้เคยใช้ผลิตภัณฑ์คล้ายกันโดยไม่มีปัญหา", "ไม่สามารถคาดการณ์ปฏิกิริยาได้ทุกกรณี การทดสอบแพ้อาจช่วยประเมินความไว แต่ไม่สามารถรับประกันว่าจะไม่เกิดปฏิกิริยา", "ฉันจะแจ้งพนักงานทันทีหากมีอาการแสบ คัน หรือไม่สบายผิดปกติระหว่างรับบริการ", "หากมีประวัติแพ้หรือเคยมีปฏิกิริยารุนแรง ร้านอาจปรับ เลื่อน หรืองดบริการ และ/หรือแนะนำการทดสอบแพ้ตามความเหมาะสม"], "declaration_title": "คำรับรองและความยินยอมของลูกค้า", "declaration": "ข้าพเจ้ารับรองว่าข้อมูลเกี่ยวกับประวัติการแพ้ การระคายเคือง ปฏิกิริยาที่เคยเกิดขึ้น และภาวะผิวที่เกี่ยวข้องที่แจ้งไว้เป็นความจริงตามที่ข้าพเจ้าทราบ ข้าพเจ้าเข้าใจว่าเป็นหน้าที่ของข้าพเจ้าในการแจ้งประวัติการแพ้ การระคายเคือง ปฏิกิริยาที่เคยเกิดขึ้น หรือภาวะผิวที่เกี่ยวข้องก่อนรับบริการ หากข้าพเจ้าทราบข้อมูลดังกล่าวแต่ไม่ได้แจ้งให้ทางร้านทราบ ข้าพเจ้าเข้าใจว่า Lashes Boudoir ไม่สามารถรับผิดชอบต่อปฏิกิริยาที่เกิดขึ้นอันเป็นผลจากข้อมูลหรือประวัติที่ไม่ได้เปิดเผยดังกล่าวได้ ข้าพเจ้าเข้าใจผลิตภัณฑ์และปฏิกิริยาที่อาจเกิดขึ้นจากบริการที่เลือก ได้มีโอกาสสอบถามข้อมูล และยินยอมรับบริการ", "confirm_declaration": "ข้าพเจ้าได้อ่านและยอมรับคำรับรองและความยินยอมของลูกค้าข้างต้น", "confirm_disclosed": "ข้าพเจ้ายืนยันว่าได้แจ้งประวัติการแพ้ การระคายเคือง และปฏิกิริยาที่ข้าพเจ้าทราบทั้งหมดแก่พนักงานแล้ว", "signature": "ลายเซ็นลูกค้า", "footer": "หากอาการรุนแรงหรือแย่ลง ควรพบแพทย์เพื่อรับการประเมินที่เหมาะสม"}, "photo": {"title": "รูปภาพของคุณ", "required": "ข้าพเจ้ายินยอมให้ Lashes Boudoir ถ่ายภาพก่อนและหลังทำบริการ และส่งภาพให้ข้าพเจ้าเป็นการส่วนตัว", "promo": "Lashes Boudoir สามารถใช้ภาพของข้าพเจ้าเพื่อการประชาสัมพันธ์ (เว็บไซต์ โซเชียลมีเดีย) (ไม่บังคับ)", "promo_hint": "ไม่บังคับ หากไม่ยินยอม คุณยังคงได้รับภาพของคุณตามปกติ และสามารถถอนความยินยอมได้ทุกเมื่อ", "style_title": "สไตล์ภาพ", "style_natural": "ธรรมชาติ", "style_soft": "รีทัชอ่อน ๆ", "style_light": "รีทัชเบา ๆ", "style_natural_desc": "ภาพตามจริง ไม่มีการแต่งภาพ", "style_soft_desc": "ปรับผิวให้เนียนอย่างอ่อนโยนมาก", "style_light_desc": "ปรับผิวให้เนียน สีผิวสม่ำเสมอขึ้นเล็กน้อย", "style_info": "ภาพแบบธรรมชาติจะส่งตามที่ถ่ายจริง (ปรับเพียงสีและแสง) แบบรีทัชอ่อน ๆ จะช่วยให้ผิวดูเนียนขึ้นอย่างแนบเนียน แบบรีทัชเบา ๆ จะปรับผิวให้เนียนและสีผิวสม่ำเสมอขึ้นอีกเล็กน้อย ทุกแบบจะไม่แต่งขนตา คิ้ว และริมฝีปาก เพื่อแสดงผลลัพธ์ของบริการตามจริง", "pdpa_title": "ประกาศความเป็นส่วนตัว (PDPA)", "pdpa": "Lashes Boudoir เก็บรวบรวมชื่อ วันเกิด ข้อมูลติดต่อ ข้อมูลบริการและประวัติการแพ้ ลายเซ็น และภาพถ่ายบริการของคุณ เพื่อให้บริการ จัดทำประวัติลูกค้า (รวมถึงการยืนยันอายุ) และส่งภาพก่อน/หลังให้คุณเป็นการส่วนตัว เราจะเก็บข้อมูลไว้เพียงระยะเวลาที่จำกัด ภาพต้นฉบับจะถูกลบเมื่อครบกำหนด เว้นแต่คุณยินยอมให้ใช้เพื่อการประชาสัมพันธ์ หากคุณเลือกรับข่าวสาร เราจะใช้อีเมลของคุณเพื่อส่งข่าวสารและข้อเสนอพิเศษด้วย และคุณสามารถยกเลิกการรับได้ทุกเมื่อ คุณสามารถขอดู แก้ไข หรือลบข้อมูล หรือถอนความยินยอมได้ทุกเมื่อ โดยติดต่อเราที่ร้าน หรือทาง LINE, WhatsApp หรืออีเมล (hello@lashesboudoir.com)"}, "nophoto": {"title": "ความเป็นส่วนตัว", "pdpa_title": "ประกาศความเป็นส่วนตัว (PDPA)", "pdpa": "Lashes Boudoir เก็บรวบรวมชื่อ วันเกิด ข้อมูลติดต่อ ข้อมูลบริการและประวัติการแพ้ และลายเซ็นของคุณ เพื่อให้บริการและจัดทำประวัติลูกค้า (รวมถึงการยืนยันอายุ) เราจะเก็บข้อมูลไว้เพียงระยะเวลาที่จำกัด หากคุณเลือกรับข่าวสาร เราจะใช้อีเมลของคุณเพื่อส่งข่าวสารและข้อเสนอพิเศษด้วย และคุณสามารถยกเลิกการรับได้ทุกเมื่อ คุณสามารถขอดู แก้ไข หรือลบข้อมูล หรือถอนความยินยอมได้ทุกเมื่อ โดยติดต่อเราที่ร้าน หรือทาง LINE, WhatsApp หรืออีเมล (hello@lashesboudoir.com)"}, "marketing": {"label": "ส่งข่าวสารและข้อเสนอพิเศษจาก Lashes Boudoir ให้ฉันทางอีเมล (ไม่บังคับ)", "hint": "คุณสามารถยกเลิกได้ทุกเมื่อ"}, "forms": {"visit_first": "มาครั้งแรก", "visit_returning": "ลูกค้าเก่า", "form_waiver": "แบบยินยอมเรื่องการแพ้และสุขภาพ", "form_photo": "ความยินยอมในการถ่ายภาพ", "forms_signed": "แบบฟอร์มที่ลงนามในครั้งนี้", "health_q": "สุขภาพ อาการแพ้ หรือยาที่ใช้ของคุณ มีการเปลี่ยนแปลงตั้งแต่ครั้งล่าสุดที่มาหรือไม่?", "health_yes": "มี", "health_no": "ไม่มี", "health_yes_note": "ขอบคุณค่ะ กรุณาตอบคำถามเรื่องการแพ้และสุขภาพด้านล่าง", "health_answer_no": "ลูกค้ายืนยันว่าไม่มีการเปลี่ยนแปลงด้านสุขภาพ อาการแพ้ หรือยาที่ใช้ ตั้งแต่ครั้งล่าสุด", "health_answer_yes": "ลูกค้าแจ้งว่ามีการเปลี่ยนแปลงตั้งแต่ครั้งล่าสุด จึงกรอกแบบยินยอมเรื่องการแพ้และสุขภาพฉบับเต็ม", "service_title": "บริการวันนี้", "photosign_sub": "กรุณาอ่าน ทำเครื่องหมาย และลงชื่อด้านล่าง", "e_health": "กรุณาเลือก มี หรือ ไม่มี", "form_health": "คำยืนยันด้านสุขภาพ", "healthsign_title": "คำยืนยันด้านสุขภาพ", "healthsign_sub": "กรุณาอ่านข้อความด้านล่างและลงชื่อ", "healthsign_text": "ข้าพเจ้ายืนยันว่าสุขภาพ อาการแพ้ และยาที่ใช้ ไม่มีการเปลี่ยนแปลงตั้งแต่ครั้งล่าสุดที่มา และได้แจ้งพนักงานถึงสิ่งที่อาจมีผลต่อการทำบริการวันนี้แล้ว"}}}, "code_alphabet": "23456789ABCDEFGHJKMNPQRSTUVWXYZ", "add_code_length": 4, "messages": {"en": "Please send me my before and after photos :) - {first_name} #{code}", "th": "รบกวนส่งรูปก่อนและหลังให้หน่อยนะคะ :) - {first_name} #{code}"}, "line_basic_id": "@941pymsd", "line_add_url": "https://lin.ee/gWouSXV", "wa_e164": "+66839799228", "wa_display": "+66 83 979 9228", "examples": ["1_before.jpg", "2_after.jpg", "3_split.jpg", "4_stacked.jpg"], "photo": {"max_edge": 8064, "quality": 0.92, "max_bytes": 18874368}, "sheet_name": "Lashes Boudoir – Asoke Clients"};
const LB_CSS = "\n.lb-root{--cream:#F5F0E8;--sand:#E8DFD3;--stone:#CFC6B8;--taupe:#A39383;--sage:#7D8471;--clay:#A0705A;--espresso:#4A3F35;\n--paper:#FBF8F3;--radius:18px;--serif:\"LB Cormorant Garamond\",\"LB Sarabun\",Georgia,serif;--sans:\"LB Jost\",\"LB Sarabun\",system-ui,sans-serif;\n--safe-b:env(safe-area-inset-bottom,0px)}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n.lb-root{margin:0;height:100%;background:var(--cream);color:var(--espresso);font-family:var(--sans);font-size:20px;line-height:1.5;\n-webkit-font-smoothing:antialiased;overscroll-behavior:none}\n.lb-root[lang=th]{line-height:1.65}\nbutton,input,select,textarea{font:inherit;color:inherit}\nh1,h2,h3{font-family:var(--serif);font-weight:500;letter-spacing:.01em;margin:0 0 .4em;line-height:1.15}\n.lb-root[lang=th] h1,.lb-root[lang=th] h2,.lb-root[lang=th] h3{font-weight:300;line-height:1.35}\nh1{font-size:52px}h2{font-size:36px}h3{font-size:26px}\n.eyebrow{font-size:14px;letter-spacing:.28em;text-transform:uppercase;color:var(--taupe)}\n.lb-root[lang=th] .eyebrow{letter-spacing:.05em}\n.muted{color:var(--taupe)} .small{font-size:16px}\n.hidden{display:none!important}\n\n.screen{position:fixed;inset:0;display:flex;flex-direction:column;overflow:hidden}\n.scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:40px 64px 140px}\n@media (orientation:landscape){.scroll{padding-left:max(64px,calc(50% - 440px));padding-right:max(64px,calc(50% - 440px))}}\n\n.topbar{display:flex;align-items:center;gap:16px;padding:18px 32px;border-bottom:1px solid var(--sand);background:var(--cream);min-height:84px}\n.topbar .brand{display:flex;align-items:center;gap:12px;font-family:var(--serif);font-size:28px}\n.topbar .brand img{height:46px}\n.topbar .sp{flex:1}\n.pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:99px;background:var(--sand);font-size:15px;letter-spacing:.06em}\n.pill.sage{background:#E3E6DC;color:#4F5645}.pill.clay{background:#F0E1D8;color:#7C4E3A}.pill.stone{background:var(--stone)}\n\n/* buttons */\n.btn{appearance:none;border:1px solid var(--espresso);background:transparent;border-radius:99px;min-height:64px;padding:0 34px;\nfont-size:19px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:background .15s,transform .1s}\n.lb-root[lang=th] .btn{letter-spacing:.02em;text-transform:none;font-size:21px}\n.btn:active{transform:scale(.98)}\n.btn.primary{background:var(--espresso);color:var(--cream)}\n.btn.sage{background:var(--sage);border-color:var(--sage);color:#fff}\n.btn.clay{background:var(--clay);border-color:var(--clay);color:#fff}\n.btn.ghost{border-color:var(--stone)}\n.btn.small{min-height:48px;padding:0 20px;font-size:15px}\n.btn[disabled]{opacity:.4;pointer-events:none}\n.iconbtn{appearance:none;border:none;background:none;min-width:56px;min-height:56px;font-size:26px;cursor:pointer;color:var(--espresso)}\n.linkbtn{appearance:none;border:none;background:none;color:var(--clay);font-size:17px;cursor:pointer;padding:10px 4px;display:inline-flex;align-items:center;gap:8px}\n.linkbtn .i{display:inline-grid;place-items:center;width:26px;height:26px;border:1px solid var(--clay);border-radius:50%;font-family:var(--serif);font-style:italic;font-size:17px}\n\n/* lock */\n#scr-lock,#scr-lang,#scr-branch{align-items:center;justify-content:center;text-align:center;background:radial-gradient(ellipse at top,var(--paper),var(--cream) 60%,var(--sand))}\n.logo-hero{width:170px;margin-bottom:16px}\n.wordmark{font-family:var(--serif);font-size:58px;font-weight:400;letter-spacing:.04em;margin:0}\n.tag{font-size:14px;letter-spacing:.38em;text-transform:uppercase;color:var(--taupe);margin:6px 0 40px}\n.dots{display:flex;gap:18px;justify-content:center;margin:20px 0 34px}\n.dots i{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--taupe)}\n.dots i.on{background:var(--espresso);border-color:var(--espresso)}\n.dots.shake{animation:shake .4s}\n@keyframes shake{25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}\n.keypad{display:grid;grid-template-columns:repeat(3,104px);gap:20px;justify-content:center}\n.keypad button{height:104px;border-radius:50%;border:1px solid var(--stone);background:rgba(255,255,255,.4);font-family:var(--serif);font-size:40px;cursor:pointer}\n.keypad button:active{background:var(--sand)}\n.keypad button.fn{border:none;background:none;font-family:var(--sans);font-size:16px;letter-spacing:.1em;color:var(--taupe)}\n\n.choice-grid{display:grid;gap:22px;width:min(640px,86vw)}\n.choice{border:1px solid var(--stone);background:rgba(255,255,255,.5);border-radius:var(--radius);padding:30px 34px;text-align:left;cursor:pointer;display:flex;align-items:center;gap:20px;min-height:110px}\n.choice:active{background:var(--sand)}\n.choice .t{font-family:var(--serif);font-size:38px;line-height:1.1}\n.choice .s{color:var(--taupe);font-size:17px;letter-spacing:.08em}\n.choice .arrow{margin-left:auto;font-size:28px;color:var(--taupe)}\n.lang-btns{display:flex;flex-direction:column;gap:24px;width:min(520px,80vw);margin-top:20px}\n.lang-btns .btn{min-height:96px;font-size:28px;letter-spacing:.14em}\n.lang-btns .btn.th{font-family:\"LB Sarabun\";letter-spacing:.04em;font-size:30px;text-transform:none}\n.corner{position:absolute;top:18px;right:22px;font-size:14px;color:var(--taupe);letter-spacing:.14em;text-transform:uppercase;background:none;border:none;padding:16px;cursor:pointer}\n\n/* home */\n.home-grid{display:grid;gap:24px;margin-top:20px}\n.home-card{display:flex;align-items:center;gap:26px;padding:34px;border-radius:24px;background:var(--paper);border:1px solid var(--sand);cursor:pointer;text-align:left;width:100%}\n.home-card .ic{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;font-size:36px;background:var(--sand);flex:none}\n.home-card h2{margin:0}.home-card p{margin:4px 0 0;color:var(--taupe)}\n\n/* forms */\n.step-head{margin-bottom:28px}\n.progress{display:flex;gap:10px;margin-bottom:22px}\n.progress i{flex:1;height:4px;border-radius:4px;background:var(--sand)}\n.progress i.on{background:var(--clay)}\n.field{margin-bottom:26px}\n.field>label,.label{display:block;font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:var(--taupe);margin-bottom:10px}\n.lb-root[lang=th] .field>label,.lb-root[lang=th] .label{letter-spacing:.02em;font-size:17px;text-transform:none}\n.req::after{content:\" *\";color:var(--clay)}\n.input,select.input,textarea.input{width:100%;min-height:68px;border:1px solid var(--stone);background:var(--paper);border-radius:14px;padding:14px 20px;font-size:22px;outline:none;transition:border .15s}\ntextarea.input{min-height:120px;resize:vertical}\n.input:focus{border-color:var(--clay);box-shadow:0 0 0 3px rgba(160,112,90,.15)}\nselect.input{appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--taupe) 50%),linear-gradient(135deg,var(--taupe) 50%,transparent 50%);background-position:calc(100% - 26px) 30px,calc(100% - 19px) 30px;background-size:7px 7px;background-repeat:no-repeat;padding-right:46px}\n.row{display:grid;gap:18px;grid-template-columns:1fr 1fr}\n.row3{display:grid;gap:14px;grid-template-columns:1fr 1.6fr 1.2fr}\n.phone-row{display:grid;gap:14px;grid-template-columns:180px 1fr}\n.hint{font-size:16px;color:var(--taupe);margin-top:8px}\n.err{color:#9B3B2A;font-size:16px;margin-top:8px;display:none}\n.field.invalid .err{display:block}.field.invalid .input{border-color:#C0705F}\n.seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:12px}\n.seg button,.chip{min-height:68px;border:1px solid var(--stone);background:var(--paper);border-radius:14px;font-size:20px;cursor:pointer;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:10px;text-align:center}\n.seg button.on,.chip.on{background:var(--espresso);color:var(--cream);border-color:var(--espresso)}\n.chips{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n.chip{justify-content:flex-start;text-align:left;line-height:1.25}\n.chip::before{content:\"\";flex:none;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--taupe)}\n.chip.on::before{background:var(--cream) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='%234A3F35' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center/18px no-repeat;border-color:var(--cream)}\n\n.card{background:var(--paper);border:1px solid var(--sand);border-radius:var(--radius);padding:28px 30px;margin-bottom:22px}\n.card h3{margin-top:0}\ndetails.acc{border-top:1px solid var(--sand)}\ndetails.acc:last-child{border-bottom:1px solid var(--sand)}\ndetails.acc summary{list-style:none;display:flex;align-items:center;min-height:68px;font-family:var(--serif);font-size:25px;cursor:pointer;gap:12px}\n.lb-root[lang=th] details.acc summary{font-family:\"LB Sarabun\";font-size:21px}\ndetails.acc summary::-webkit-details-marker{display:none}\ndetails.acc summary::after{content:\"+\";margin-left:auto;font-family:var(--sans);font-size:28px;color:var(--taupe)}\ndetails.acc[open] summary::after{content:\"–\"}\ndetails.acc p,details.acc ul{margin:0 0 20px;font-size:18px;color:#5b4f44}\n.declaration{font-size:18px;color:#5b4f44}\n\n.check{display:flex;gap:18px;align-items:flex-start;padding:18px 20px;border:1px solid var(--stone);border-radius:14px;background:var(--paper);cursor:pointer;margin-bottom:14px;font-size:19px;line-height:1.45}\n.check .box{flex:none;width:34px;height:34px;border-radius:9px;border:1.5px solid var(--taupe);display:grid;place-items:center;margin-top:2px;background:#fff}\n.check.on{border-color:var(--sage);background:#F1F2EC}\n.check.on .box{background:var(--sage);border-color:var(--sage)}\n.check.on .box::after{content:\"\";width:10px;height:18px;border:solid #fff;border-width:0 3px 3px 0;transform:rotate(45deg) translate(-1px,-2px)}\n.check.invalid{border-color:#C0705F}\n.optional-tag{display:inline-block;font-size:13px;letter-spacing:.14em;text-transform:uppercase;border:1px solid var(--taupe);color:var(--taupe);padding:1px 10px;border-radius:99px;margin-left:6px;vertical-align:2px}\n\n.sigwrap{position:relative;border:1px dashed var(--taupe);border-radius:14px;background:#fff;height:240px;touch-action:none}\n.sigwrap canvas{width:100%;height:100%;display:block;border-radius:14px}\n.sigwrap .ph{position:absolute;left:24px;bottom:22px;right:24px;border-top:1px solid var(--stone);color:var(--stone);font-size:15px;padding-top:6px;pointer-events:none}\n.sigwrap .clr{position:absolute;top:8px;right:8px}\n.sigwrap.invalid{border-color:#C0705F}\n\n.bottombar{position:absolute;left:0;right:0;bottom:0;padding:18px 40px calc(18px + var(--safe-b));display:flex;gap:16px;align-items:center;\nbackground:linear-gradient(to top,var(--cream) 70%,rgba(245,240,232,0));}\n.bottombar .sp{flex:1}\n.bottombar .btn{min-width:200px}\n\n/* add us */\n.qr-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin:18px 0}\n.qr-card{background:var(--paper);border:1px solid var(--sand);border-radius:24px;padding:22px;text-align:center}\n.qr-card img{width:100%;max-width:240px;aspect-ratio:1;border-radius:12px;background:#fff;padding:10px;border:1px solid var(--sand)}\n.qr-card .nm{font-family:var(--serif);font-size:32px;margin:12px 0 0}\n.qr-card .ph{display:inline-block;margin-top:8px;font-size:12px;letter-spacing:.14em;color:var(--clay);border:1px dashed var(--clay);padding:2px 10px;border-radius:99px}\n.staff-box{border:1px dashed var(--taupe);border-radius:18px;padding:18px 22px;margin-top:22px}\n.staff-box .label{margin-bottom:12px}\n\n/* chair */\n.tabs{display:flex;gap:10px;background:var(--sand);padding:6px;border-radius:99px;margin-bottom:24px}\n.tabs button{flex:1;min-height:60px;border:none;border-radius:99px;background:transparent;font-size:18px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}\n.tabs button.on{background:var(--paper);box-shadow:0 1px 4px rgba(74,63,53,.12)}\n.client-row{display:flex;align-items:center;gap:20px;padding:22px 24px;background:var(--paper);border:1px solid var(--sand);border-radius:20px;margin-bottom:14px;cursor:pointer;width:100%;text-align:left}\n.client-row .av{width:66px;height:66px;border-radius:50%;background:var(--sand);display:grid;place-items:center;font-family:var(--serif);font-size:28px;flex:none}\n.client-row .nm{font-family:var(--serif);font-size:30px;line-height:1.1}\n.client-row .meta{color:var(--taupe);font-size:16px}\n.client-row .st{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}\n.client-row.prio{border-color:var(--clay);box-shadow:0 0 0 1px var(--clay) inset}\n.sect-label{margin:26px 0 12px}\n\n/* name card */\n#scr-card{background:var(--espresso)}\n.namecard{flex:1;margin:22px 22px 0;border-radius:28px;background:var(--cream);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;position:relative;overflow:hidden}\n.namecard::before{content:\"\";position:absolute;inset:18px;border:1px solid var(--stone);border-radius:18px;pointer-events:none}\n.namecard img.logo{width:190px}\n.namecard .brand{font-family:var(--serif);font-size:34px;letter-spacing:.08em;margin:4px 0 30px}\n.namecard .kind{font-size:30px;letter-spacing:.4em;text-transform:uppercase;padding:12px 40px;border-radius:99px;background:var(--sage);color:#fff;margin-bottom:30px}\n.lb-root[lang=th] .namecard .kind{letter-spacing:.05em;font-size:34px}\n.namecard .kind.after{background:var(--clay)}\n.namecard .name{font-family:var(--serif);font-size:112px;line-height:1.02;font-weight:500}\n.lb-root[lang=th] .namecard .name{font-size:104px}\n@media (orientation:landscape){.namecard img.logo{width:130px}.namecard .name{font-size:84px!important}.namecard .brand{margin-bottom:18px}.namecard .kind{margin-bottom:18px}}\n.namecard .svc{font-size:30px;margin-top:22px;color:#6a5d51}\n.namecard .rule{width:120px;height:1px;background:var(--taupe);margin:30px auto}\n.namecard .meta{font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:var(--taupe)}\n.lb-root[lang=th] .namecard .meta{letter-spacing:.04em}\n.card-bar{padding:18px 22px calc(18px + var(--safe-b));display:flex;gap:16px;align-items:center;color:var(--cream)}\n.card-bar .btn{border-color:var(--cream);color:var(--cream)}\n.card-bar .btn.primary{background:var(--cream);color:var(--espresso)}\n.thumbs{display:flex;gap:12px;overflow-x:auto;flex:1;min-height:96px;align-items:center}\n.thumb{position:relative;flex:none;width:88px;height:88px;border-radius:12px;overflow:hidden;border:2px solid var(--cream)}\n.thumb img{width:100%;height:100%;object-fit:cover}\n.thumb .k{position:absolute;left:0;right:0;bottom:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;background:rgba(74,63,53,.75);text-align:center}\n.thumb .x{position:absolute;top:2px;right:2px;width:30px;height:30px;border-radius:50%;border:none;background:rgba(0,0,0,.55);color:#fff;font-size:16px}\n.capture{width:96px;height:96px;border-radius:50%;border:4px solid var(--cream);background:var(--clay);flex:none;cursor:pointer;display:grid;place-items:center;color:#fff;font-size:15px;letter-spacing:.1em}\n\n/* modal */\n.modal{position:fixed;inset:0;background:rgba(43,36,30,.72);display:flex;align-items:center;justify-content:center;z-index:50;padding:30px}\n.modal .box{background:var(--cream);border-radius:28px;width:min(820px,100%);max-height:100%;display:flex;flex-direction:column;overflow:hidden;position:relative}\n.modal .close{position:absolute;top:12px;right:12px;width:60px;height:60px;border-radius:50%;border:none;background:var(--paper);font-size:30px;cursor:pointer;z-index:2;box-shadow:0 2px 8px rgba(0,0,0,.12)}\n.gallery{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}\n.gallery::-webkit-scrollbar{display:none}\n.gallery img{flex:none;width:100%;scroll-snap-align:center;max-height:70vh;object-fit:contain;background:var(--sand)}\n.gal-foot{padding:18px 28px 26px;text-align:center}\n.gal-foot .cap{font-family:var(--serif);font-size:28px;margin:6px 0 12px}\n.gal-dots{display:flex;gap:10px;justify-content:center}\n.gal-dots i{width:10px;height:10px;border-radius:50%;background:var(--stone)}.gal-dots i.on{background:var(--clay)}\n.gal-nav{position:absolute;top:40%;width:60px;height:60px;border-radius:50%;border:none;background:rgba(251,248,243,.85);font-size:28px;cursor:pointer}\n.gal-nav.prev{left:14px}.gal-nav.next{right:14px}\n.pinmodal .box{padding:40px;text-align:center;width:auto}\n\n.toast{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);background:var(--espresso);color:var(--cream);padding:16px 28px;border-radius:99px;z-index:60;font-size:18px}\n.done-hero{text-align:center;padding-top:30px}\n.empty{text-align:center;color:var(--taupe);padding:60px 0}\n.style-seg button{min-height:96px;padding:14px 18px;line-height:1.3}\n.style-seg button .small{opacity:.8}\n\n/* staff photo choice */\n#scr-photochoice{background:var(--sand)}\n#scr-photochoice .topbar{background:var(--sand);border-color:var(--stone)}\n.pc-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:34px}\n.pc-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:300px;border-radius:28px;border:2px solid var(--stone);background:var(--paper);cursor:pointer;padding:28px;text-align:center}\n.pc-btn .ic{font-size:56px;line-height:1;color:var(--taupe)}\n.pc-btn .t{font-family:var(--serif);font-size:44px;line-height:1.1}\n.pc-btn .s{color:var(--taupe);font-size:17px}\n.pc-btn.yes .ic{color:var(--sage)} .pc-btn.no .ic{color:var(--clay)}\n.pc-btn.on.yes{border-color:var(--sage);background:#EEF0E8;box-shadow:0 0 0 3px var(--sage) inset}\n.pc-btn.on.no{border-color:var(--clay);background:#F4E8E1;box-shadow:0 0 0 3px var(--clay) inset}\n.reason-chips{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n.reason-chips button{min-height:68px;border-radius:99px;border:1px solid var(--stone);background:var(--paper);font-size:19px;cursor:pointer}\n.reason-chips button.on{background:var(--espresso);color:var(--cream);border-color:var(--espresso)}\n/* chair: no-photos rows */\n.client-row.off .av,.client-row.off .nm,.client-row.off .meta,.client-row.off .pill{opacity:.6}\n.client-row.off{background:transparent;border-style:dashed;cursor:default}\n.client-row.off .nm{text-decoration:none}\n.row-wrap{position:relative}\n.row-wrap .toggle{position:absolute;right:24px;bottom:12px}\n.mini{font-size:13px;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--clay);color:var(--clay);background:var(--paper);border-radius:99px;padding:8px 14px;cursor:pointer}\n.mini[disabled]{border-color:var(--stone);color:var(--taupe);cursor:not-allowed}\n#scr-photochoice .pill{background:var(--paper)}\n\n.scan-banner{text-align:center;background:var(--paper);border:1px solid var(--sand);border-radius:20px;padding:14px 20px;margin:6px 0 4px}\n.scan-banner .big{font-family:var(--serif);font-size:34px;color:var(--espresso);line-height:1.2}\n.qr-card img[src*=\"/qr/\"]{max-width:300px;padding:6px}\n.addus-msg{text-align:center;font-size:15px;color:#6b5f54;margin:2px 0 8px}\n.addus-msg .lbl{font-size:13px;color:var(--taupe);margin-right:6px}\n.staff-box .hint{margin:-4px 0 12px;font-size:13px;line-height:1.4}\n\n/* ---- serverless edition additions (scoped inside the shadow root) ---- */\n:host{all:initial;position:fixed;inset:0;z-index:2147483000;display:block}\n.lb-root{position:fixed;inset:0;overflow:hidden;text-align:left;text-transform:none;letter-spacing:normal;word-spacing:normal;white-space:normal}\n.lb-root img{max-width:none;border:0}\n.lb-root a{color:inherit}\n.syncpill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:99px;font-size:14px;letter-spacing:.04em;background:#E3E6DC;color:#4F5645;border:none;cursor:pointer;white-space:nowrap}\n.syncpill.wait{background:#F3E7C9;color:#6d5517}.syncpill.fail{background:#F0D5CC;color:#7C3A2A}\n.offline-banner{background:#F3E7C9;color:#6d5517;border-radius:14px;padding:14px 18px;margin:0 0 18px;font-size:16px}\n.setup-box{width:min(640px,88vw);text-align:left}\n.setup-box .input{width:100%}\n.queue-list{margin:10px 0 0;padding:0;list-style:none;font-size:15px}\n.queue-list li{padding:10px 0;border-bottom:1px solid var(--sand);display:flex;gap:12px;align-items:center;justify-content:space-between}\n.qr-card img.qr{max-width:300px;padding:6px;image-rendering:pixelated}\n.thumb .ondrive{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:12px;letter-spacing:.06em;background:rgba(255,255,255,.12)}\n.local-tag{font-size:12px;letter-spacing:.08em;color:var(--clay);border:1px dashed var(--clay);border-radius:99px;padding:1px 8px;margin-left:8px}\n#scr-setup{align-items:center;justify-content:center;background:radial-gradient(ellipse at top,var(--paper),var(--cream) 60%,var(--sand));overflow-y:auto;padding:40px 0}\n/* email marketing opt-in sits directly under the Email field (step 1) */\n.field[data-field=\"email\"]{margin-bottom:14px}\n.field.marketing .check{margin-bottom:8px}\n/* ---- gas-1.3.0 device roles ---- */\n.device-card .role-now{font-size:20px}\n.device-card .role-seg{grid-auto-flow:row}\n.device-card .role-seg button{min-height:76px;text-align:left;justify-content:flex-start;padding:12px 18px}\n.name-row{display:flex;gap:12px;align-items:center}.name-row .input{flex:1;min-width:0}\n.kiosk-note{margin-top:26px}\n.note-banner{display:flex;gap:12px;align-items:center;justify-content:space-between;background:#F0D5CC;color:#7C3A2A;border-radius:14px;padding:12px 16px;margin:0 0 12px;font-size:16px}\n.pull-hint{height:0;overflow:hidden;text-align:center;color:var(--taupe);font-size:14px;letter-spacing:.1em;transition:height .15s}\n.pull-hint.on{height:32px}\n#scr-chair .gear{font-size:26px}\n.btn.spin{opacity:.6}\n.card-warn{margin:12px 22px 0;padding:10px 16px;border-radius:14px;background:#F3E7C9;color:#6d5517;font-size:16px}\n/* live capture */\n#scr-capture{background:#000;color:#fff}\n.cap-top{display:flex;align-items:center;gap:10px;padding:max(8px,env(safe-area-inset-top,0px)) 12px 8px;min-height:60px}\n.cap-top .iconbtn{color:#fff;font-size:32px}\n.cap-title{flex:1;min-width:0;display:flex;align-items:center;gap:10px;font-family:var(--serif);font-size:26px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.cap-kind{width:12px;height:12px;border-radius:50%;background:var(--sage);flex:none}.cap-kind.after{background:var(--clay)}\n.cap-res{font-size:12px;letter-spacing:.06em;opacity:.7}\n.cap-warn{margin:0 12px 8px;padding:8px 12px;border-radius:12px;background:#F3E7C9;color:#6d5517;font-size:15px}\n.cap-view{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}\n.cap-frame{position:relative;width:100%;height:100%}\n.cap-frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#111}\n.cap-guides{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;fill:none;stroke:rgba(255,253,249,.9);stroke-width:2}\n.cap-guides .level{stroke:rgba(255,253,249,.5);stroke-dasharray:6 6;stroke-width:1.5}\n.cap-guides .iris{stroke:rgba(255,253,249,.45);stroke-width:1.5}\n.cap-guides text{fill:rgba(255,253,249,.92);stroke:none;font:15px/1 var(--sans);letter-spacing:.04em}\n.cap-guides.hidden{display:none}\n.cap-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}\n.cap-flash.go{animation:capflash .35s ease-out}\n@keyframes capflash{0%{opacity:.85}100%{opacity:0}}\n.cap-msg{position:absolute;left:16px;right:16px;bottom:16px;text-align:center;font-size:16px;text-shadow:0 1px 3px #000}\n.cap-msg:empty{display:none}\n.cap-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px calc(14px + var(--safe-b))}\n.cap-bar .btn{border-color:#fff;color:#fff;min-width:118px}\n.shutter{width:84px;height:84px;border-radius:50%;border:4px solid #fff;background:transparent;padding:5px;cursor:pointer;flex:none}\n.shutter i{display:block;width:100%;height:100%;border-radius:50%;background:#fff}\n.shutter:active i{transform:scale(.92)}\n.shutter:disabled{opacity:.35}\n@media (max-width:600px){\n  .cap-title{font-size:22px}\n  .cap-bar .btn{min-width:0;padding:0 14px}\n  .card-warn{margin:8px 10px 0;font-size:14px}\n  .device-card .role-seg button{min-height:68px}\n  #scr-chair .topbar .brand{font-size:21px}\n}\n/* gas-1.3.0 staff pre-select: \"No photos\" (consent / waiver only) */\n.pc-nophoto{margin-top:12px;border-top:1px dashed var(--line, #E8DFD3);padding-top:14px}\n.health-decl .declaration{font-size:1.05em;line-height:1.55}\n.pc-btn.on{border-color:var(--espresso);background:#EFEBE2;box-shadow:0 0 0 3px rgba(74,63,53,.12)}\n.pc-btn.on .ic{color:var(--espresso)}\n\n/* ---- phone layout (added gas-1.1.0) --------------------------------------------------------------\n   Everything below sits inside media queries that never match an iPad (768-1366 px wide, >=768 px tall),\n   so the iPad layout is unchanged. Phones in portrait (320-600 px) get the first block,\n   phones in landscape (height <= 500 px) the second. */\n@media (max-width:600px){\n.lb-root{font-size:17px;-webkit-text-size-adjust:100%;text-size-adjust:100%}\n.lb-root h1{font-size:clamp(30px,8.6vw,36px)}\n.lb-root h2{font-size:clamp(24px,6.6vw,28px)}\n.lb-root h3{font-size:21px}\n.lb-root .eyebrow{font-size:12px;letter-spacing:.22em}\n.lb-root[lang=th] .eyebrow{letter-spacing:.04em;font-size:13px}\n.lb-root .small{font-size:15px}\n.lb-root p{overflow-wrap:break-word}\n\n/* screens + scrolling */\n.scroll{padding:22px 18px calc(120px + var(--safe-b));overflow-x:hidden}\n#scr-lock,#scr-lang,#scr-branch,#scr-setup{justify-content:flex-start;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:24px 18px calc(24px + var(--safe-b))}\n#scr-lock::before,#scr-lang::before,#scr-branch::before,#scr-setup::before{content:\"\";flex:none;margin-top:auto}   /* centred, but never clipped at the top */\n#scr-lock::after,#scr-lang::after,#scr-branch::after,#scr-setup::after{content:\"\";flex:none;margin-bottom:auto}\n\n/* top bar */\n.topbar{padding:8px 12px;gap:8px;min-height:60px;padding-top:max(8px,env(safe-area-inset-top,0px))}\n.topbar .brand{font-size:21px;gap:8px;white-space:nowrap;min-width:0}\n.topbar .brand img{height:32px}\n.topbar .btn.small{min-height:44px;padding:0 14px;font-size:13px;letter-spacing:.08em}\n.lb-root[lang=th] .topbar .btn.small{font-size:16px}\n.topbar .corner{padding:12px 6px;min-height:44px}\n.iconbtn{min-width:44px;min-height:44px;font-size:28px;padding:0}\n.pill,.syncpill{font-size:12px;padding:5px 10px;letter-spacing:.03em}\n.syncpill{min-height:32px}\n/* home + photo chair have 3 controls: they move to a 2nd row under the title */\n#scr-home .topbar,#scr-chair .topbar{flex-wrap:wrap;row-gap:4px}\n#scr-home .topbar .sp,#scr-chair .topbar .sp{flex:0 0 100%;height:0}\n#scr-home .topbar .btn.small,#scr-chair .topbar .btn.small{margin-left:auto}\n\n/* buttons */\n.btn{min-height:52px;padding:0 22px;font-size:15px;letter-spacing:.1em}\n.lb-root[lang=th] .btn{font-size:17px}\n.btn.small{min-height:44px;padding:0 16px;font-size:13px}\n.linkbtn{font-size:15px;min-height:44px}\n.corner{top:max(8px,env(safe-area-inset-top,0px));right:8px;padding:14px 12px}\n\n/* setup / PIN / branch / language */\n.logo-hero{width:96px!important;margin-bottom:8px}\n.lb-root .wordmark{font-size:clamp(32px,10vw,40px)}\n.tag{font-size:12px;letter-spacing:.3em;margin:4px 0 22px}\n.dots{gap:16px;margin:10px 0 24px}\n.dots i{width:16px;height:16px}\n.keypad{grid-template-columns:repeat(3,min(78px,22vw));gap:min(18px,4vw) min(22px,5vw)}\n.keypad button{height:min(78px,22vw);font-size:32px}\n.keypad button.fn{font-size:13px}\n#pin-msg{margin-top:14px!important}\n.choice-grid{width:100%;max-width:640px;gap:14px}\n.choice{padding:16px 20px;min-height:76px;gap:14px}\n.choice .t{font-size:28px}\n.choice .s{font-size:13px}\n#scr-branch>p.muted{margin-bottom:22px!important}\n.setup-box{width:100%;max-width:640px}\n#scr-lang .logo-hero{width:120px!important}\n#scr-lang h2{font-size:26px}\n.lang-btns{width:100%;max-width:420px;gap:16px;margin-top:14px}\n.lang-btns .btn{min-height:68px;font-size:21px}\n.lang-btns .btn.th{font-size:23px}\n\n/* home */\n.home-grid{gap:14px;margin-top:14px}\n.home-card{padding:18px;gap:16px;border-radius:20px}\n.home-card .ic{width:56px;height:56px;font-size:26px}\n.home-card h2{font-size:24px}\n.home-card p{font-size:15px;line-height:1.4}\n\n/* forms */\n.step-head{margin-bottom:20px}\n.progress{margin-bottom:14px;gap:8px}\n.field{margin-bottom:20px}\n.field>label,.label{font-size:12px;letter-spacing:.14em;margin-bottom:8px}\n.lb-root[lang=th] .field>label,.lb-root[lang=th] .label{font-size:15px}\n.input,select.input,textarea.input{min-height:52px;font-size:17px;padding:10px 14px;border-radius:12px}\ntextarea.input{min-height:110px}\nselect.input{padding:10px 30px 10px 12px;background-position:calc(100% - 17px) 50%,calc(100% - 11px) 50%;background-size:6px 6px;text-overflow:ellipsis}\n.row{grid-template-columns:1fr;gap:0}\n.row[style*=\"2fr\"]{grid-template-columns:1fr auto!important;gap:10px;align-items:end}   /* signature label + date */\n.row[style*=\"2fr\"] .label{margin-bottom:8px}\n.row3{gap:8px;grid-template-columns:.9fr 1.6fr 1.15fr}\n.phone-row{gap:8px;grid-template-columns:116px 1fr}\n.hint,.err{font-size:15px}\n.seg{gap:8px}\n.seg button,.chip{min-height:52px;font-size:16px;padding:8px 10px;border-radius:12px;gap:8px}\n.chips{gap:8px}\n.chip{line-height:1.25;padding:10px 12px}\n.chip::before{width:20px;height:20px;border-radius:6px}\n.chip.on::before{background-size:15px}\n.style-seg{grid-auto-flow:row}\n.style-seg button{min-height:64px;padding:10px 14px}\n.field>div[style*=\"space-between\"]{flex-wrap:wrap;row-gap:0}\n.card{padding:18px 16px;margin-bottom:18px;border-radius:16px}\ndetails.acc summary{font-size:21px;min-height:56px}\n.lb-root[lang=th] details.acc summary{font-size:18px}\ndetails.acc summary::after{font-size:24px}\ndetails.acc p,details.acc ul{font-size:16px}\ndetails.acc ul{padding-left:20px}\n.declaration{font-size:16px}\n.check{gap:12px;padding:14px;font-size:16px;margin-bottom:10px}\n.check .box{width:28px;height:28px;border-radius:8px;margin-top:0}\n.check.on .box::after{width:8px;height:15px}\n.optional-tag{font-size:11px;padding:1px 8px}\n\n/* signature pad: full width, a bit lower */\n.sigwrap{height:200px}\n.sigwrap .ph{left:16px;right:16px;bottom:18px;font-size:13px}\n.sigwrap .clr{top:6px;right:6px;min-height:44px}\n\n/* bottom bar */\n.bottombar{padding:12px 14px calc(12px + var(--safe-b));gap:10px}\n.bottombar .btn{min-width:96px}\n.bottombar .btn.primary,.bottombar .btn.clay{min-width:150px;padding:0 24px}\n\n/* add us */\n#ci-body .step-head h1[style]{font-size:clamp(28px,8vw,34px)!important}\n.scan-banner{padding:12px 14px;border-radius:16px}\n.scan-banner .big{font-size:24px}\n.qr-grid{grid-template-columns:1fr;gap:14px;margin:14px 0}\n.qr-card{padding:16px;border-radius:20px}\n.qr-card img.qr,.qr-card img{width:min(240px,70vw);max-width:none}\n.qr-card .nm{font-size:26px;margin-top:6px}\n.addus-msg{font-size:15px}\n.staff-box{padding:14px;border-radius:16px}\n.done-hero img[style]{width:130px!important;margin-top:12vh!important}\n.done-hero h1[style]{font-size:44px!important}\n\n/* staff photo choice */\n.pc-grid{grid-template-columns:1fr;gap:14px;margin-top:20px}\n.pc-btn{min-height:128px;padding:18px;gap:6px;border-radius:22px}\n.pc-btn .ic{font-size:36px}\n.pc-btn .t{font-size:32px}\n.pc-btn .s{font-size:15px}\n.reason-chips{gap:8px}\n.reason-chips button{min-height:52px;font-size:16px;padding:6px 12px;line-height:1.25}\n#pc-reasons .label[style]{margin-top:24px!important}\n#pc-reasons .btn[style]{margin-top:20px!important}\n\n/* photo chair list */\n.tabs{margin-bottom:16px;padding:4px}\n.tabs button{min-height:48px;font-size:15px}\n.client-row{flex-wrap:wrap;gap:8px 14px;padding:14px;border-radius:16px;margin-bottom:10px}\n.client-row .av{width:48px;height:48px;font-size:20px}\n.client-row>div:nth-child(2){flex:1 1 180px;min-width:0}\n.client-row .nm{font-size:23px;overflow-wrap:anywhere}\n.client-row .meta{font-size:14px}\n.client-row .st{margin-left:auto}\n.mini{min-height:40px;font-size:12px}\n.sect-label{margin:20px 0 10px}\n.offline-banner{font-size:15px;padding:12px 14px}\n\n/* name card + capture bar */\n.namecard{margin:max(10px,env(safe-area-inset-top,0px)) 10px 0;padding:24px 18px;border-radius:22px}\n.namecard::before{inset:10px;border-radius:14px}\n.namecard img.logo{width:96px}\n.namecard .brand{font-size:22px;margin:2px 0 16px}\n.namecard .kind{font-size:17px;letter-spacing:.32em;padding:8px 24px;margin-bottom:18px}\n.lb-root[lang=th] .namecard .kind{font-size:20px}\n.lb-root .namecard .name,.lb-root[lang=th] .namecard .name{font-size:clamp(42px,14vw,62px);overflow-wrap:anywhere}\n.namecard .svc{font-size:18px;margin-top:12px}\n.namecard .rule{margin:18px auto;width:90px}\n.namecard .meta{font-size:13px;letter-spacing:.14em}\n.card-bar{flex-wrap:wrap;gap:10px;padding:10px 12px calc(10px + var(--safe-b))}\n.card-bar>.btn:first-child{order:1;padding:0 16px;min-height:52px}\n.card-bar .seg{order:2;flex:1 1 auto;width:auto!important;min-width:0}\n.card-bar .seg button{min-height:52px!important;padding:6px 8px}\n.card-bar .capture{order:3;width:72px;height:72px;font-size:12px;border-width:3px}\n.card-bar .thumbs{order:4;flex:1 1 150px;min-width:0;min-height:64px;gap:8px}\n.card-bar>.btn.small{order:5}\n.thumb{width:64px;height:64px;border-radius:10px}\n.thumb .k{font-size:10px}\n\n/* modals, gallery, toast */\n.modal{padding:max(12px,env(safe-area-inset-top,0px)) 12px max(12px,var(--safe-b))}\n.modal .box{border-radius:22px;max-height:100%;overflow-y:auto}\n.modal .box[style*=\"padding:36px\"]{padding:28px 18px!important}\n.modal .close{width:48px;height:48px;font-size:26px;top:8px;right:8px}\n.pinmodal .box{padding:32px 18px 20px}\n.gallery img{max-height:62vh}\n.gal-nav{width:44px;height:44px;font-size:24px}\n.gal-nav.prev{left:8px}.gal-nav.next{right:8px}\n.gal-foot{padding:12px 16px 18px}\n.gal-foot .cap{font-size:22px}\n.toast{bottom:calc(96px + var(--safe-b));width:max-content;max-width:calc(100vw - 32px);text-align:center;font-size:16px;padding:12px 20px;border-radius:22px}\n\n/* settings */\n.queue-list li{flex-wrap:wrap;overflow-wrap:anywhere}\n.lb-root .card h3{margin-bottom:.3em}\n}\n\n@media (max-width:360px){\n.scroll{padding-left:14px;padding-right:14px}\n.row3{grid-template-columns:.85fr 1.5fr 1.1fr}\n.phone-row{grid-template-columns:104px 1fr}\n.topbar .brand{font-size:19px}\n.bottombar .btn.primary,.bottombar .btn.clay{min-width:130px;padding:0 18px}\n}\n\n/* phone held sideways (short screen): compact, keep everything on one screen where it matters */\n@media (orientation:landscape) and (max-height:500px){\n.lb-root{-webkit-text-size-adjust:100%;text-size-adjust:100%}\n.scroll{padding:16px max(20px,env(safe-area-inset-left,0px)) calc(96px + var(--safe-b)) max(20px,env(safe-area-inset-right,0px))}\n.topbar{min-height:56px;padding:6px 16px}\n.topbar .brand img{height:32px}\n.topbar .brand{font-size:22px}\n#scr-lock,#scr-lang,#scr-branch,#scr-setup{justify-content:flex-start;overflow-y:auto;padding:16px 20px}\n#scr-lock::before,#scr-lang::before,#scr-branch::before,#scr-setup::before{content:\"\";flex:none;margin-top:auto}\n#scr-lock::after,#scr-lang::after,#scr-branch::after,#scr-setup::after{content:\"\";flex:none;margin-bottom:auto}\n.logo-hero{width:72px!important}\n.keypad{grid-template-columns:repeat(3,64px);gap:10px 18px}\n.keypad button{height:64px;font-size:28px}\n.bottombar{padding:8px 20px calc(8px + var(--safe-b))}\n.btn{min-height:48px}\n.namecard{margin:8px 12px 0;padding:14px}\n.namecard::before{inset:8px}\n.lb-root .namecard img.logo{width:52px}\n.namecard .brand{font-size:18px;margin:0 0 6px!important}\n.namecard .kind{font-size:14px;padding:5px 20px;margin-bottom:8px!important}\n.lb-root .namecard .name,.lb-root[lang=th] .namecard .name{font-size:clamp(34px,10vh,48px)!important}\n.namecard .svc{font-size:15px;margin-top:6px}\n.namecard .rule{margin:8px auto}\n.namecard .meta{font-size:12px}\n.card-bar{padding:8px 12px calc(8px + var(--safe-b));gap:10px}\n.card-bar .seg{width:200px!important}\n.card-bar .seg button{min-height:48px!important}\n.card-bar .capture{width:64px;height:64px;font-size:12px}\n.thumbs{min-height:64px}\n.thumb{width:56px;height:56px}\n.modal{padding:8px}\n.gallery img{max-height:60vh}\n}\n@media (max-width:600px){.syncpill{min-height:44px;padding:5px 12px}.mini{min-height:44px}}\n";
const LB_SHELL = "<!-- First run on this iPad: connect to the Apps Script web app -->\n<section id=\"scr-setup\" class=\"screen hidden\">\n  <img class=\"logo-hero\" src=\"__A__lb-logo.png\" alt=\"\" style=\"width:120px\">\n  <div class=\"eyebrow\">Set up this device</div>\n  <h1>Connect to Google</h1>\n  <div class=\"setup-box\">\n    <p class=\"muted\">Paste the Apps Script web app URL and the access token (from the owner's setup sheet). Stored only on this device.</p>\n    <div class=\"field\"><label class=\"req\">Apps Script web app URL</label><input class=\"input\" id=\"setup-endpoint\" autocapitalize=\"off\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"https://script.google.com/macros/s/…/exec\"></div>\n    <div class=\"field\"><label class=\"req\">Access token</label><input class=\"input\" id=\"setup-token\" type=\"password\" autocapitalize=\"off\" autocomplete=\"off\" spellcheck=\"false\"></div>\n    <button class=\"btn primary\" style=\"width:100%\" data-act=\"setup-connect\">Connect</button>\n    <p class=\"muted small\" id=\"setup-msg\" style=\"min-height:30px;margin-top:18px\"></p>\n  </div>\n</section>\n\n<!-- Staff PIN -->\n<section id=\"scr-lock\" class=\"screen hidden\">\n  <img class=\"logo-hero\" src=\"__A__lb-logo.png\" alt=\"\">\n  <h1 class=\"wordmark\">Lashes Boudoir</h1>\n  <div class=\"tag\">Staff access</div>\n  <div class=\"dots\" id=\"pin-dots\"><i></i><i></i><i></i><i></i></div>\n  <div class=\"keypad\" id=\"pin-pad\"></div>\n  <p class=\"muted small\" id=\"pin-msg\" style=\"min-height:30px;margin-top:24px\"></p>\n</section>\n\n<!-- Branch picker -->\n<section id=\"scr-branch\" class=\"screen hidden\">\n  <img class=\"logo-hero\" src=\"__A__lb-logo.png\" alt=\"\" style=\"width:120px\">\n  <div class=\"eyebrow\">This device</div>\n  <h1>Which branch is this?</h1>\n  <p class=\"muted\" style=\"margin-bottom:34px\">Saved on this device. Change it later in Settings.</p>\n  <div class=\"choice-grid\" id=\"branch-list\"></div>\n</section>\n\n<!-- Staff home -->\n<section id=\"scr-home\" class=\"screen hidden\">\n  <div class=\"topbar\"><div class=\"brand\"><img src=\"__A__lb-logo-header@2x.png\" alt=\"\">Lashes Boudoir</div><div class=\"sp\"></div>\n    <button class=\"syncpill\" data-act=\"settings\"></button><span class=\"pill\" id=\"home-branch\"></span><button class=\"btn small ghost\" data-act=\"lock\">Lock</button></div>\n  <div class=\"scroll\">\n    <div class=\"eyebrow\" id=\"home-date\"></div>\n    <h1>Good day</h1>\n    <div class=\"home-grid\">\n      <button class=\"home-card\" data-act=\"start-checkin\"><div class=\"ic\">✍︎</div><div><h2>Client check-in</h2><p>Hand the iPad to the client: details, allergy consent, signature &amp; photo consent.</p></div></button>\n      <button class=\"home-card\" data-act=\"settings\"><div class=\"ic\">⚙︎</div><div><h2>Settings</h2><p>Branch, device role, connection &amp; sync queue.</p></div></button>\n    </div>\n    <p class=\"muted small kiosk-note\">Check-in kiosk: client details, consent and signature only. Before / after photos are taken on the staff Camera phone.</p>\n  </div>\n</section>\n\n<!-- Settings -->\n<section id=\"scr-settings\" class=\"screen hidden\">\n  <div class=\"topbar\"><button class=\"iconbtn\" data-act=\"home\">‹</button><div class=\"brand\">Settings</div><div class=\"sp\"></div><button class=\"syncpill\" data-act=\"sync-now\"></button></div>\n  <div class=\"scroll\" id=\"settings-body\"></div>\n</section>\n\n<!-- Staff-only (kiosk): which forms this visit? (gas-1.3.0) -->\n<section id=\"scr-photochoice\" class=\"screen hidden\">\n  <div class=\"topbar\"><button class=\"iconbtn\" data-act=\"pc-back\">‹</button><div class=\"brand\">New check-in</div><div class=\"sp\"></div><span class=\"pill\" id=\"pc-branch\"></span></div>\n  <div class=\"scroll staff-scr\">\n    <div class=\"eyebrow\">Staff only · before handing over the iPad</div>\n    <h1>Which forms today?</h1>\n    <p class=\"muted\">Photo consent is signed at every visit. Returning clients are asked whether anything changed; \"Yes\" opens the full allergy &amp; health waiver.</p>\n    <div class=\"pc-grid\">\n      <button class=\"pc-btn visit\" data-act=\"pc-visit\" data-v=\"first\"><span class=\"ic\">✦</span><span class=\"t\">First visit</span><span class=\"s\">Allergy &amp; health waiver + photo consent</span></button>\n      <button class=\"pc-btn visit\" data-act=\"pc-visit\" data-v=\"returning\"><span class=\"ic\">↺</span><span class=\"t\">Returning</span><span class=\"s\">Photo consent + \"any changes to health, allergies or medication?\"</span></button>\n    </div>\n    <div id=\"pc-forms\" class=\"hidden\">\n      <div class=\"label\" style=\"margin-top:30px\">Forms this visit · tap to switch on / off</div>\n      <div id=\"pc-toggles\"></div>\n      <div class=\"check pc-nophoto\" data-act=\"pc-nophoto\" role=\"checkbox\" aria-checked=\"false\"><span class=\"box\"></span><span><b style=\"font-weight:500\">No photos</b><br><span class=\"small muted\">Consent / waiver only: no photo consent, no photo-use box. Not shown on the Camera phones.</span></span></div>\n      <div id=\"pc-reasons\" class=\"hidden\">\n        <div class=\"label\" style=\"margin-top:18px\">No photos · reason (optional)</div>\n        <div class=\"reason-chips\" id=\"pc-chips\"></div>\n      </div>\n      <p class=\"muted small\" id=\"pc-note\" style=\"min-height:24px\"></p>\n      <button class=\"btn primary\" style=\"width:100%;margin-top:18px\" data-act=\"pc-start\">Hand the iPad to the client ›</button>\n    </div>\n  </div>\n</section>\n\n<!-- Language choice (client-facing start) -->\n<section id=\"scr-lang\" class=\"screen hidden\">\n  <button class=\"corner\" data-act=\"staff-exit\">Staff</button>\n  <img class=\"logo-hero\" src=\"__A__lb-logo.png\" alt=\"\" style=\"width:210px\">\n  <h1 class=\"wordmark\">Lashes Boudoir</h1>\n  <div class=\"tag\">Lash · Brow · Beauty</div>\n  <h2 style=\"font-style:italic;font-weight:400\">Welcome <span class=\"muted\">·</span> <span style=\"font-family:'LB Sarabun';font-style:normal;font-weight:300;font-size:.8em\">ยินดีต้อนรับ</span></h2>\n  <div class=\"lang-btns\">\n    <button class=\"btn primary\" data-act=\"lang\" data-lang=\"en\">English</button>\n    <button class=\"btn th\" data-act=\"lang\" data-lang=\"th\">ภาษาไทย</button>\n  </div>\n</section>\n\n<!-- Check-in wizard -->\n<section id=\"scr-ci\" class=\"screen hidden\">\n  <div class=\"topbar\"><div class=\"brand\"><img src=\"__A__lb-logo-header@2x.png\" alt=\"\">Lashes Boudoir</div><div class=\"sp\"></div>\n    <button class=\"btn small ghost\" data-act=\"switch-lang\" id=\"ci-switch\"></button>\n    <button class=\"corner\" style=\"position:static\" data-act=\"staff-exit\">Staff</button></div>\n  <div class=\"scroll\" id=\"ci-body\"></div>\n  <div class=\"bottombar\" id=\"ci-bar\"></div>\n</section>\n\n<!-- Camera role: Today's clients (opens straight here on a Camera device; never reachable on a Check-in kiosk) -->\n<section id=\"scr-chair\" class=\"screen hidden\">\n  <div class=\"topbar\"><div class=\"brand\"><img src=\"__A__lb-logo-header@2x.png\" alt=\"\">Camera</div><div class=\"sp\"></div>\n    <button class=\"syncpill\" data-act=\"settings\"></button><span class=\"pill\" id=\"chair-branch\"></span><button class=\"btn small ghost\" data-act=\"chair-refresh\">↻ Refresh</button>\n    <button class=\"btn small ghost\" data-act=\"lock\">Lock</button><button class=\"iconbtn gear\" data-act=\"settings\" aria-label=\"Settings\">⚙︎</button></div>\n  <div class=\"scroll\" id=\"chair-body\"></div>\n</section>\n\n<!-- Name card (client card) -->\n<section id=\"scr-card\" class=\"screen hidden\">\n  <div class=\"namecard\" id=\"namecard\"></div>\n  <div class=\"card-warn hidden\" id=\"card-warn\"></div>\n  <div class=\"card-bar\" id=\"card-bar\"></div>\n  <input type=\"file\" id=\"cam\" accept=\"image/*\" capture=\"environment\" class=\"hidden\">\n</section>\n\n<!-- Live capture with eye guides (Camera role) -->\n<section id=\"scr-capture\" class=\"screen hidden\">\n  <div class=\"cap-top\"><button class=\"iconbtn\" data-act=\"cap-close\" aria-label=\"Back\">‹</button><div class=\"cap-title\"><span class=\"cap-kind\" id=\"cap-kind\"></span><span id=\"cap-title\"></span></div><span class=\"cap-res\" id=\"cap-res\"></span></div>\n  <div class=\"cap-warn hidden\" id=\"cap-warn\"></div>\n  <div class=\"cap-view\" id=\"cap-view\"><div class=\"cap-frame\" id=\"cap-frame\"><video id=\"cap-video\" playsinline muted autoplay></video><svg class=\"cap-guides\" id=\"cap-guides\" xmlns=\"http://www.w3.org/2000/svg\"></svg><div class=\"cap-flash\" id=\"cap-flash\"></div></div>\n    <div class=\"cap-msg\" id=\"cap-msg\"></div></div>\n  <div class=\"cap-bar\"><button class=\"btn small\" data-act=\"cap-native\">Camera app</button><button class=\"shutter\" id=\"cap-shoot\" data-act=\"cap-shoot\" aria-label=\"Take photo\"><i></i></button><button class=\"btn small\" data-act=\"cap-guides\">Guides</button></div>\n</section>\n\n<div id=\"modal-root\"></div>\n";
/* Lashes Boudoir iPad check-in — serverless edition.
   Runs inside a shadow root (Squarespace code block or static host) and talks to a Google Apps Script web app.
   Build-time globals in this scope: I18N, LB_DATA, LB_CSS, LB_SHELL, LB_QR, LB_VERSION. */
const D = LB_DATA;
let R = null, A = './', HOST = null;               // shadow root, asset base URL, host element
const $ = (s, el) => (el || R).querySelector(s);
const $$ = (s, el) => [...(el || R).querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
             set: (k, v) => localStorage.setItem(k, JSON.stringify(v)), del: k => localStorage.removeItem(k) };

const S = { lang: 'en', branch: LS.get('lb_branch', null),
  settings: LS.get('lb_settings', { facing: 'environment', namecardPhoto: false }),
  step: 1, f: null, visitId: null, addCode: null, photos: { enabled: true, reason: null }, pcFromHome: true,
  chairTab: 'before', visits: [], chairOffline: false, card: null, sync: { pending: 0, failed: 0, problem: null, busy: false } };
const T = k => (I18N[S.lang] || I18N.en)[k] ?? k;

/* ---------------- device role (gas-1.3.0) ----------------
   'kiosk'  = Check-in kiosk: clients fill in details, consent, signature, opt-ins. No photo / chair screens at all.
   'camera' = staff phone: opens on Today's clients → name card → live capture with eye guides. No check-in form.
   Default by screen size (iPad-size → kiosk, phone → camera); changed in Settings › This device behind the manager PIN. */
const isPhoneSize = () => Math.min(screen.width || innerWidth, screen.height || innerHeight) < 600;
const devKind = () => { const u = navigator.userAgent || ''; return /iPhone/.test(u) ? 'iPhone' : (/iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) ? 'iPad' : isPhoneSize() ? 'Phone' : 'Tablet'; };
function device() {
  let d = LS.get('lb_device', null) || {};
  if (!/^[0-9a-f]{12}$/.test(d.id || '')) { d = { ...d, id: newId().slice(0, 12) }; LS.set('lb_device', d); }
  const set = d.role === 'kiosk' || d.role === 'camera';
  return { id: d.id, role: set ? d.role : (isPhoneSize() ? 'camera' : 'kiosk'), roleSet: set, name: d.name || (devKind() + ' ' + d.id.slice(0, 4).toUpperCase()) };
}
const role = () => device().role;
function setDevice(patch) { LS.set('lb_device', { ...(LS.get('lb_device', null) || {}), ...patch }); }
const ROLE_NAME = { kiosk: 'Check-in kiosk', camera: 'Camera' };
const KIOSK_SCREENS = ['home', 'photochoice', 'lang', 'ci'], CAMERA_SCREENS = ['chair', 'card', 'capture'];
const content = lang => D.content[lang];

/* ---------------- connection to Apps Script ---------------- */
class NetError extends Error {}
const conn = () => LS.get('lb_conn', { endpoint: (HOST && HOST.dataset.endpoint) || '', token: '' });
async function gas(action, payload = {}, { timeout = 30000 } = {}) {
  const c = conn();
  if (!c.endpoint || !c.token) { const e = new Error('not_connected'); e.code = 'not_connected'; throw e; }
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeout);
  let r;
  try {   // text/plain = "simple" CORS request: no preflight, which Apps Script cannot answer
    r = await fetch(c.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, credentials: 'omit',
      redirect: 'follow', signal: ctl.signal, body: JSON.stringify({ ...payload, action, token: c.token, client: (role() === 'camera' ? 'camera/' : 'ipad/') + LB_VERSION }) });
  } catch (e) { throw new NetError(e.name === 'AbortError' ? 'timeout' : 'network'); }
  finally { clearTimeout(timer); }
  if (r.status >= 500 || r.status === 429) throw new NetError('http_' + r.status);
  let d; try { d = await r.json(); } catch { const e = new Error('not_json'); e.code = 'not_json'; throw e; }   // e.g. a Google login page: deployment not set to "Anyone"
  if (!d.ok) { const e = new Error(d.error || 'error'); e.code = d.error; e.detail = d.detail; throw e; }
  return d;
}
const CONFIG_ERRORS = new Set(['bad_token', 'server_not_configured', 'not_json', 'not_connected', 'sheet_header_mismatch', 'folder_not_found']);
const RETRYABLE = new Set(['server_error', 'busy', 'lock_timeout', 'no_consent']);   // no_consent: the check-in may still be saving its consent.pdf

/* ---------------- IndexedDB: offline queue, local visit mirror, thumbnails ---------------- */
const DB = {
  _db: null,
  open() { return this._db || (this._db = new Promise((res, rej) => {
    const q = indexedDB.open('lb-checkin', 1);
    q.onupgradeneeded = () => { const db = q.result;
      db.createObjectStore('queue', { keyPath: 'qid', autoIncrement: true }); db.createObjectStore('visits', { keyPath: 'id' }); db.createObjectStore('thumbs', { keyPath: 'key' }); };
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); })); },
  async run(store, mode, fn) { const db = await this.open(); return new Promise((res, rej) => {
    const tx = db.transaction(store, mode), st = tx.objectStore(store); const rq = fn(st); let out;
    if (rq) rq.onsuccess = () => { out = rq.result; }; tx.oncomplete = () => res(out); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); }); },
  put(s, v) { return this.run(s, 'readwrite', st => st.put(v)); },
  get(s, k) { return this.run(s, 'readonly', st => st.get(k)); },
  del(s, k) { return this.run(s, 'readwrite', st => st.delete(k)); },
  all(s) { return this.run(s, 'readonly', st => st.getAll()); },
};

async function enqueue(type, vid, payload, extra = {}) {
  await DB.put('queue', { type, vid, payload, created: new Date().toISOString(), attempts: 0, state: 'pending', ...extra });
  await paintSync(); flushSoon();
}
let flushing = false, retryTimer = null, backoff = 0;
function flushSoon(ms = 50) { clearTimeout(retryTimer); retryTimer = setTimeout(flush, ms); }
function scheduleRetry(ms) { backoff = Math.min(backoff ? backoff * 2 : 5000, 60000); flushSoon(ms || backoff); }
async function blobToB64(blob) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = () => rej(fr.error); fr.readAsDataURL(blob); }); }
async function sendItem(it) {
  if (it.type === 'photo') {
    const data = await blobToB64(it.blob);
    return gas('photo', { ...it.payload, data }, { timeout: 180000 });
  }
  return gas(it.type, it.payload, { timeout: it.type === 'checkin' ? 60000 : 30000 });
}
async function flush() {
  if (flushing) return; flushing = true; S.sync.busy = true; paintSync();
  try {
    const items = (await DB.all('queue')).filter(i => i.state !== 'failed').sort((a, b) => a.qid - b.qid);
    for (const it of items) {
      try {
        const res = await sendItem(it);
        await DB.del('queue', it.qid); backoff = 0; S.sync.problem = null;
        await afterSent(it, res);
      } catch (e) {
        if (e instanceof NetError) { S.sync.problem = 'offline'; scheduleRetry(); break; }
        if (CONFIG_ERRORS.has(e.code)) { S.sync.problem = e.code; scheduleRetry(60000); break; }
        it.attempts = (it.attempts || 0) + 1; it.lastError = e.code + (e.detail ? ': ' + e.detail : '');
        if (!RETRYABLE.has(e.code) || it.attempts >= 5) it.state = 'failed';
        await DB.put('queue', it);
        if (it.state !== 'failed') { scheduleRetry(); break; }
      }
      paintSync();
    }
  } finally { flushing = false; S.sync.busy = false; paintSync(); }
}
async function afterSent(it, res) {
  if (it.type === 'checkin') {
    const v = await DB.get('visits', it.vid);
    if (v) { v.synced = true; if (res.add_code !== undefined && res.add_code !== v.add_code) { v.add_code = res.add_code; v.code_changed = true; } await DB.put('visits', v); }
    if (S.visitId === it.vid && res.add_code && res.add_code !== S.addCode) { S.addCode = res.add_code; if (S.step === 5) renderAddUs(); }
  }
  if (it.type === 'photo') photoNotice(it, res);
  if (it.type === 'photo') { const lv = await DB.get('visits', it.vid); if (lv && lv.photos && lv.photos[it.payload.kind] === 'pending') { lv.photos[it.payload.kind] = true; await DB.put('visits', lv); }
    if (S.card && S.card.v.id === it.vid && S.card.v.photos[it.payload.kind] === 'pending') { S.card.v.photos[it.payload.kind] = true; if (!$('#scr-card').classList.contains('hidden')) renderCard(); } }
  if (it.type === 'photos_enabled') { const lv = await DB.get('visits', it.vid); if (lv) { lv.synced_toggle_at = lv.local_toggle_at; await DB.put('visits', lv); } }
}
async function paintSync() {
  try { const q = await DB.all('queue'); S.sync.pending = q.filter(i => i.state !== 'failed').length; S.sync.failed = q.filter(i => i.state === 'failed').length; } catch {}
  const s = S.sync; let cls = '', txt = '✓ All synced';
  if (s.failed) { cls = 'fail'; txt = `! ${s.failed} need attention`; }
  else if (s.problem && s.problem !== 'offline' && s.pending) { cls = 'fail'; txt = '! Sync blocked — check Settings'; }
  else if (s.pending) { cls = 'wait'; txt = s.problem === 'offline' ? `⟳ Offline · ${s.pending} waiting` : `⟳ Syncing ${s.pending}…`; }
  $$('.syncpill').forEach(p => { p.className = 'syncpill ' + cls; p.textContent = txt; });
}

/* ---------------- UI basics ---------------- */
function toast(msg, ms = 2200) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('.lb-root').appendChild(t); setTimeout(() => t.remove(), ms); }
function setLang(l) { $('.lb-root').setAttribute('lang', l); }
function show(name) {
  // route guard: a kiosk can never open the client list / camera; a camera phone never shows the check-in form
  const r = role();
  if (r === 'kiosk' && CAMERA_SCREENS.includes(name)) name = 'home';
  else if (r === 'camera' && KIOSK_SCREENS.includes(name)) { name = 'chair'; setTimeout(() => loadChair(), 0); }
  if (name !== 'capture') stopCam();
  if (name !== 'settings') S.mgrUntil = 0;
  $$('.screen').forEach(s => s.classList.add('hidden')); $('#scr-' + name).classList.remove('hidden'); setLang(['lang','ci','card'].includes(name) ? S.lang : 'en'); paintSync();
}
const visible = name => { const el = R && $('#scr-' + name); return !!el && !el.classList.contains('hidden'); };
const svcName = (id, lang = S.lang) => D.services.find(s => s.id === id)?.[lang] ?? id;
const branchName = (b, lang = 'en') => D.branches[b]?.[lang] ?? b;
const fmtDate = (d, lang) => new Date(d + 'T12:00:00').toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
function newId() { const b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80; return [...b].map(x => x.toString(16).padStart(2, '0')).join(''); }
function newCode() { const out = []; while (out.length < D.add_code_length) { const [x] = crypto.getRandomValues(new Uint8Array(1)); if (x < 248) out.push(D.code_alphabet[x % 31]); } return out.join(''); }
async function sha(s) { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join(''); }

/* ---------------- setup (first run) ---------------- */
function showSetup(msg) {
  const c = conn(); $('#setup-endpoint').value = c.endpoint || (HOST.dataset.endpoint || ''); $('#setup-token').value = c.token || '';
  $('#setup-msg').textContent = msg || ''; show('setup');
}
async function setupConnect() {
  const endpoint = $('#setup-endpoint').value.trim(), token = $('#setup-token').value.trim(), m = $('#setup-msg');
  if (!/^https?:\/\/\S+$/.test(endpoint) || token.length < 16) { m.textContent = 'Please paste the full web app URL and the token (at least 16 characters).'; return; }
  const prev = conn(); LS.set('lb_conn', { endpoint, token }); m.textContent = 'Connecting…';
  try { const r = await gas('ping', {}, { timeout: 20000 }); LS.set('lb_pin_len', r.pin_length || 4); LS.set('lb_mgr_pin_len', r.manager_pin_length || 4); S.sync.problem = null; m.textContent = 'Connected ✓';
    LS.del('lb_unlock_until'); setTimeout(() => { initLock(); show('lock'); flushSoon(); }, 400); }
  catch (e) {
    const why = e instanceof NetError ? 'Could not reach the URL (check Wi-Fi and the URL).' : e.code === 'bad_token' ? 'The token was rejected.'
      : e.code === 'not_json' ? 'Google returned a login page: the deployment must use "Who has access: Anyone".' : 'Error: ' + (e.code || e.message);
    m.textContent = why; if (prev.token) LS.set('lb_conn', prev); else LS.set('lb_conn', { endpoint, token: '' });
  }
}

/* ---------------- PIN ---------------- */
let pin = '';
// lvl: undefined = staff PIN (unlocks the app), 'manager' = manager PIN (gas-1.3.0, unlocks Settings › This device)
const pinLen = lvl => lvl === 'manager' ? LS.get('lb_mgr_pin_len', 4) : LS.get('lb_pin_len', 4);
function buildPad(root, onDone, lvl) {
  root.innerHTML = ['1','2','3','4','5','6','7','8','9','clear','0','⌫'].map(k => `<button class="${k.length > 1 ? 'fn' : ''}" data-k="${k}">${k === 'clear' ? 'CLEAR' : k}</button>`).join('');
  root.onclick = e => { const k = e.target.closest('button')?.dataset.k; if (!k) return;
    if (k === 'clear') pin = ''; else if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 8) pin += k;
    paintDots(root.parentElement, lvl); if (pin.length === pinLen(lvl) && k !== '⌫' && k !== 'clear') onDone(pin); };
}
function paintDots(scope, lvl) { const d = $('.dots', scope); if (!d) return; d.innerHTML = Array.from({ length: pinLen(lvl) }, (_, i) => `<i class="${i < pin.length ? 'on' : ''}"></i>`).join(''); }
async function checkPin(p, lvl) {
  const mgr = lvl === 'manager', key = (mgr ? 'lb-mgr-pin:' : 'lb-pin:') + conn().endpoint + ':' + p, hk = mgr ? 'lb_mgr_pin_hash' : 'lb_pin_hash';
  try {
    const r = await gas('pin', mgr ? { pin: p, level: 'manager' } : { pin: p }, { timeout: 12000 });
    // a gas-1.2.0 backend ignores "level" and would accept the STAFF pin: refuse until the Apps Script is updated
    if (mgr && r.level !== 'manager') return { ok: false, msg: 'Update the Apps Script to gas-1.3.0 first (no manager PIN yet)' };
    if (r.pin_ok) { LS.set(hk, await sha(key)); return { ok: true }; }
    return { ok: false, msg: 'Wrong PIN' };
  } catch (e) {
    if (e instanceof NetError) {   // offline: accept the last PIN verified online on this device
      const h = LS.get(hk, null);
      if (!h) return { ok: false, msg: 'Offline — connect to Wi-Fi for the first sign-in' };
      return (await sha(key)) === h ? { ok: true, offline: true } : { ok: false, msg: 'Wrong PIN' };
    }
    if (e.code === 'pin_locked') return { ok: false, msg: 'Too many attempts — wait 5 minutes' };
    if (e.code === 'bad_token' || e.code === 'not_json') return { ok: false, msg: 'Connection rejected — ask the owner to check the token', setup: true };
    return { ok: false, msg: e.code || e.message };
  }
}
async function tryPin(p, scope, ok, lvl) {
  const r = await checkPin(p, lvl); pin = ''; paintDots(scope, lvl);
  if (r.ok) { if (lvl !== 'manager') LS.set('lb_unlock_until', Date.now() + 12 * 3600e3); if (r.offline) toast('Offline sign-in'); ok(); return; }
  const d = $('.dots', scope); d.classList.add('shake'); setTimeout(() => d.classList.remove('shake'), 400);
  const m = $('#pin-msg', scope) || $('.pin-msg', scope); if (m) m.textContent = r.msg;
  if (r.setup && scope.id === 'scr-lock') setTimeout(() => showSetup(r.msg), 1500);
}
function initLock() { pin = ''; paintDots($('#scr-lock')); $('#pin-msg').textContent = ''; buildPad($('#pin-pad'), p => tryPin(p, $('#scr-lock'), afterUnlock)); }
function afterUnlock() { if (!S.branch) return showBranch(); goHome(); }
function showBranch() {
  $('#branch-list').innerHTML = Object.entries(D.branches).map(([id, b]) =>
    `<button class="choice" data-act="pick-branch" data-b="${id}"><div><div class="t">${esc(b.en)}</div><div class="s">${esc(b.city_en.toUpperCase())}</div></div><span class="arrow">›</span></button>`).join('');
  show('branch');
}
function goHome() {
  if (role() === 'camera') return openChair();
  $('#home-branch').textContent = branchName(S.branch) + ' branch';
  $('#home-date').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  show('home');
}
function staffExit() {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal pinmodal"><div class="box"><button class="close" data-act="close-modal">×</button>
    <div class="eyebrow">Staff only</div><h2>Enter PIN</h2><div class="dots"></div><div class="keypad"></div><p class="muted small pin-msg"></p></div></div>`;
  pin = ''; const box = $('.box', root); paintDots(box);
  buildPad($('.keypad', box), p => tryPin(p, box, () => { root.innerHTML = ''; goHome(); }));
}
function managerPin(onOk) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal pinmodal mgr"><div class="box"><button class="close" data-act="close-modal">×</button>
    <div class="eyebrow">Manager only</div><h2>Manager PIN</h2><div class="dots"></div><div class="keypad"></div><p class="muted small pin-msg"></p></div></div>`;
  pin = ''; const box = $('.box', root); paintDots(box, 'manager');
  buildPad($('.keypad', box), p => tryPin(p, box, () => { root.innerHTML = ''; onOk(); }, 'manager'), 'manager');
}

/* ---------------- Staff pre-select: which forms this visit (gas-1.3.0) ----------------
   First visit = allergy & health waiver + photo consent. Returning = photo consent + "any changes since your last visit?"
   (no default; Yes opens the full waiver). Staff can switch each form on / off; at least one form is always signed. */
function showPhotoChoice(fromHome) {
  S.pcFromHome = !!fromHome; S.photos = { enabled: true, reason: null }; S.forms = { visit: null, waiver: false };
  $('#pc-branch').textContent = branchName(S.branch);
  $('#pc-chips').innerHTML = Object.entries(D.photo_skip_reasons).filter(([k]) => k !== 'staff').map(([k, n]) => `<button data-act="pc-reason" data-v="${k}">${esc(n)}</button>`).join('');
  $$('.pc-btn').forEach(b => b.classList.remove('on')); $('#pc-reasons').classList.add('hidden'); $('#pc-forms').classList.add('hidden'); $('#pc-note').textContent = '';
  show('photochoice');
}
function renderPcForms(note) {
  const F = D.content.en.forms, ret = S.forms.visit === 'returning';
  const tg = (k, on, label, sub) => `<div class="check ${on ? 'on' : ''}" data-act="pc-form" data-k="${k}" role="checkbox" aria-checked="${on}"><span class="box"></span><span><b style="font-weight:500">${esc(label)}</b><br><span class="small muted">${esc(sub)}</span></span></div>`;
  $('#pc-toggles').innerHTML = tg('waiver', S.forms.waiver, F.form_waiver, S.forms.waiver ? 'Allergy & sensitivity history, information, declaration' : (ret ? 'Off: the client answers "any changes?" first; Yes switches it on' : 'Off'))
    + tg('photo', PE(), F.form_photo, PE() ? 'Before & after photos, photo consent, add-us screen' : 'Off: no photo questions, not in the photo list');
  $('#pc-reasons').classList.toggle('hidden', PE()); $('#pc-note').textContent = note || '';
  const np = $('[data-act=pc-nophoto]'); np.classList.toggle('on', !PE()); np.setAttribute('aria-checked', String(!PE()));
  $$('[data-act=pc-visit]').forEach(b => b.classList.toggle('on', b.dataset.v === S.forms.visit));
  $('#pc-forms').classList.remove('hidden');
}
// staff "No photos" (gas-1.3.0): consent / waiver only, no photo consent, no photo-use box, never in the Camera list
function setNoPhotos(off, staffBtn, noteCb) {
  S.photos.enabled = !off;
  if (!off) { S.photos.reason = null; $$('#pc-chips button').forEach(b => b.classList.remove('on')); return; }
  if (!S.photos.reason || staffBtn) { S.photos.reason = 'staff'; $$('#pc-chips button').forEach(b => b.classList.remove('on')); }
  if (!S.forms.waiver && !RET()) { S.forms.waiver = true; noteCb('Allergy & health waiver switched on: every visit signs at least one form.'); }
  else if (!S.forms.waiver) noteCb('No photos: the client answers "any changes?" and signs the health declaration (Yes opens the full waiver).');
}
const PE = () => S.photos.enabled;
const RET = () => !!(S.forms && S.forms.visit === 'returning');
const askHealth = () => RET() && !S.forms.waiver;   // returning, waiver not chosen by staff: the client answers the health question
const W = () => !!(S.forms ? (S.forms.waiver || (askHealth() && S.f && S.f.health_changed === 'yes')) : true);   // allergy waiver part of this visit?
const nSteps = () => W() ? 4 : 3;

/* ---------------- Settings ---------------- */
function deviceCard() {
  const dv = device(), open = S.mgrUntil > Date.now();
  const desc = { kiosk: 'Clients fill in their details, allergy consent, signature and opt-ins. No client list, no camera.',
    camera: "Today's clients → Before / After photos with eye guides. No check-in form." };
  return `<div class="card device-card"><h3>This device</h3>
    <div class="field" style="margin-bottom:12px"><label>Role</label>
      ${open ? `<div class="seg role-seg">${['kiosk', 'camera'].map(r => `<button class="${dv.role === r ? 'on' : ''}" data-act="set-role" data-v="${r}"><span><b style="font-weight:500">${ROLE_NAME[r]}</b><br><span class="small">${esc(desc[r])}</span></span></button>`).join('')}</div>`
        : `<div class="role-now"><b>${ROLE_NAME[dv.role]}</b>${dv.roleSet ? '' : ' <span class="muted small">(default for this screen size)</span>'}<div class="muted small">${esc(desc[dv.role])}</div></div>
           <button class="btn small" style="margin-top:12px" data-act="unlock-role">Change role or name · manager PIN</button>`}
      <div class="hint">Default: iPad-size screens are a Check-in kiosk, phones are a Camera.</div></div>
    <div class="field" style="margin-bottom:0"><label>Device name</label>
      ${open ? `<div class="name-row"><input class="input" id="dev-name" maxlength="30" autocomplete="off" value="${esc(dv.name)}"><button class="btn small" data-act="save-devname">Save</button></div>`
        : `<div><b>${esc(dv.name)}</b></div>`}
      <div class="hint">Shown to staff next to each photo (e.g. "Fern iPhone"). Staff names only, never client details.</div></div></div>`;
}
async function renderSettings() {
  const st = S.settings, c = conn(), q = (await DB.all('queue').catch(() => [])).sort((a, b) => a.qid - b.qid);
  const qDesc = i => `${esc(i.type)} · ${esc(i.vid ? i.vid.slice(0, 8) : '')} · ${esc(new Date(i.created).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))}${i.state === 'failed' ? ` · <b style="color:var(--clay)">failed: ${esc(i.lastError)}</b>` : i.lastError ? ` · ${esc(i.lastError)}` : ''}`;
  const problem = { offline: 'No connection — will retry automatically.', bad_token: 'Token rejected — tap Change connection.', not_json: 'Google returned a login page — the deployment must allow "Anyone".',
    server_not_configured: 'The Apps Script has no TOKEN set yet.', sheet_header_mismatch: 'The sheet header row does not match the expected columns A–AE.', folder_not_found: 'The Drive folder ID in Script Properties is wrong.' }[S.sync.problem] || '';
  const cam = role() === 'camera';
  $('#settings-body').innerHTML = deviceCard() + `
    <div class="field"><label>Branch for this device</label><div class="seg">${Object.entries(D.branches).map(([id, b]) => `<button class="${S.branch === id ? 'on' : ''}" data-act="set-branch" data-b="${id}">${esc(b.en)}</button>`).join('')}</div></div>
    ${cam ? `<div class="field"><label>Camera</label><div class="seg">
      <button class="${st.facing === 'environment' ? 'on' : ''}" data-act="set-facing" data-v="environment">Back camera</button>
      <button class="${st.facing === 'user' ? 'on' : ''}" data-act="set-facing" data-v="user">Front camera</button></div>
      <div class="hint">Live camera: the main back lens at the highest resolution the browser offers, with eye guides. "Camera app" button: the phone's own camera; the original full-resolution photo is kept (location and other metadata removed).</div></div>
    <div class="field"><label>Optional</label>
      <div class="check ${st.namecardPhoto ? 'on' : ''}" data-act="toggle-ncp"><span class="box"></span><span>Also offer a "Name card photo" button on the client card (not needed — photos are tagged automatically).</span></div></div>` : ''}
    <div class="card"><h3>Sync queue</h3>
      <p class="muted" style="margin:0">${q.length ? `${q.filter(i => i.state !== 'failed').length} waiting, ${q.filter(i => i.state === 'failed').length} failed.` : 'Everything is saved to Google.'} ${esc(problem)}</p>
      ${q.length ? `<ul class="queue-list">${q.map(i => `<li><span>${qDesc(i)}</span>${i.state === 'failed' ? `<button class="mini" data-act="q-retry" data-q="${i.qid}">Retry</button>` : ''}</li>`).join('')}</ul>` : ''}
      <button class="btn small" style="margin-top:14px" data-act="sync-now">Sync now</button></div>
    <div class="card"><h3>Connection</h3><p class="muted small" style="margin:0;word-break:break-all">${esc(c.endpoint || 'not set')}<br>Token: ${c.token ? '••••••' + esc(c.token.slice(-4)) : 'not set'} · app ${esc(LB_VERSION)}</p>
      <button class="btn small" style="margin-top:14px" data-act="change-conn">Change connection</button></div>
    <div class="card"><h3>Owner review</h3><p class="muted">Approve in the Google Sheet <b>“${esc(D.sheet_name)}”</b> → tab <b>Check-ins</b>, column <b>Approved</b> (Yes / Skipped). Photos, the signed consent and full details are in the private Drive folder <b>Clients/&lt;date&gt;/</b>.</p></div>`;
  show('settings');
}

/* ---------------- Check-in ---------------- */
function newForm() { return { first_name: '', last_name: '', dob_d: '', dob_m: '', dob_y: '', phone_cc: '+66', phone: '', email: '',
  preferred_contact: null, services: [], service_other: '', allergy_items: [], prev_reaction: null, known_allergies: '',
  confirm_declaration: false, confirm_disclosed: false, signature: null, photo_consent: false, promo_consent: false, photo_style: 'natural',
  marketing_consent: false, health_changed: null }; }   // health_changed: returning clients' Yes / No, never pre-selected   // email news & offers: never pre-ticked, for every client (photos or not)
function startClient(lang) { S.lang = lang; S.f = newForm(); S.step = 1; S.visitId = null; S.addCode = null; renderStep(); show('ci'); }

const CC = [['+66','🇹🇭 TH'],['+1','🇺🇸 US/CA'],['+44','🇬🇧 UK'],['+61','🇦🇺 AU'],['+64','🇳🇿 NZ'],['+65','🇸🇬 SG'],['+60','🇲🇾 MY'],['+852','🇭🇰 HK'],['+86','🇨🇳 CN'],['+81','🇯🇵 JP'],['+82','🇰🇷 KR'],['+91','🇮🇳 IN'],['+971','🇦🇪 AE'],['+49','🇩🇪 DE'],['+33','🇫🇷 FR'],['+31','🇳🇱 NL'],['+46','🇸🇪 SE'],['+41','🇨🇭 CH'],['+7','🇷🇺 RU'],['+95','🇲🇲 MM'],['+84','🇻🇳 VN'],['+62','🇮🇩 ID'],['+63','🇵🇭 PH'],['+855','🇰🇭 KH'],['+856','🇱🇦 LA']];
function progress() { return `<div class="progress">${Array.from({ length: nSteps() }, (_, i) => i + 1).map(i => `<i class="${i <= S.step ? 'on' : ''}"></i>`).join('')}</div>`; }
function head(title, sub) { return `<div class="step-head">${progress()}<div class="eyebrow">${T('step')} ${S.step} ${T('of')} ${nSteps()}</div><h1>${esc(title)}</h1>${sub ? `<p class="muted">${esc(sub)}</p>` : ''}</div>`; }
function field(key, label, inner, opts = {}) { return `<div class="field" data-field="${key}"><label class="${opts.req ? 'req' : ''}">${esc(label)}</label>${inner}${opts.hint ? `<div class="hint">${esc(opts.hint)}</div>` : ''}<div class="err">${esc(opts.err || T('e_required'))}</div></div>`; }
const inp = (k, attrs = '') => `<input class="input" data-f="${k}" value="${esc(S.f[k])}" ${attrs}>`;
const chk = (k, html, act = 'chk') => `<div class="check ${S.f[k] ? 'on' : ''}" data-act="${act}" data-k="${k}" role="checkbox" aria-checked="${!!S.f[k]}"><span class="box"></span><span>${html}</span></div>`;
const infoBtn = () => `<button class="linkbtn" data-act="examples"><span class="i">i</span>${esc(T('see_example'))}</button>`;

function renderStep() {
  const f = S.f, C = content(S.lang).consent, P = content(S.lang).photo, L = S.lang, F = content(S.lang).forms;
  const sigBlock = () => `<div class="row" style="grid-template-columns:2fr 1fr"><div class="label req">${esc(C.signature)}</div><div class="label" style="text-align:right">${esc(C.date_label || T('date_label'))}: <b style="color:var(--espresso)">${esc(fmtDate(todayISO(), L))}</b></div></div>
       <div class="field" data-field="signature"><div class="sigwrap" id="sigwrap"><canvas id="sig"></canvas><div class="ph">${esc(T('sign_here'))}</div><button class="btn small ghost clr" data-act="sig-clear">${esc(T('clear'))}</button></div><div class="err">${esc(T('e_sig'))}</div></div>`;
  // photo consent (required) + photo style + optional photo marketing use (NEVER pre-ticked) + PDPA
  const photoBlock = () => `<div class="field" data-field="photo_consent"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div class="label req" style="margin:0">${esc(P.title)}</div>${infoBtn()}</div>
        ${chk('photo_consent', esc(P.required) + ` <span class="optional-tag" style="border-color:var(--clay);color:var(--clay)">${esc(T('required_tag'))}</span>`)}<div class="err">${esc(T('e_photo'))}</div></div>
       <div class="field" data-field="photo_style"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div class="label" style="margin:0">${esc(P.style_title)}</div>
         <button class="linkbtn" data-act="style-info"><span class="i">i</span>${esc(T('about_style'))}</button></div>
         <div class="seg style-seg">${[['natural', P.style_natural, P.style_natural_desc], ['soft', P.style_soft, P.style_soft_desc], ['light', P.style_light, P.style_light_desc]].map(([v, n, d]) => `<button class="${f.photo_style === v ? 'on' : ''}" data-act="style" data-v="${v}"><span><b style="font-weight:500">${esc(n)}</b><br><span class="small">${esc(d)}</span></span></button>`).join('')}</div>
         <div class="hint hidden" id="style-info">${esc(P.style_info)}</div></div>
       <div class="field" data-field="promo_consent">${chk('promo_consent', esc(P.promo))}<div class="hint">${esc(P.promo_hint)}</div></div>
       <div class="card"><h3>${esc(P.pdpa_title)}</h3><p class="small" style="margin:0;color:#5b4f44">${esc(P.pdpa)}</p></div>`;
  $('#ci-switch').textContent = L === 'en' ? 'ภาษาไทย' : 'English';
  $('#ci-switch').classList.toggle('hidden', S.step > 4);
  let h = '', bar = '';
  const backBtn = `<button class="btn ghost" data-act="ci-back">${esc(T('back'))}</button>`;
  if (S.step === 1) {
    const yNow = new Date().getFullYear();
    const years = Array.from({ length: 101 }, (_, i) => yNow - 10 - i);
    h = head(T('s1_title'), T(PE() ? 's1_sub' : 's1_sub_np')) +
      `<div class="row">${field('first_name', T('first_name'), inp('first_name', 'autocomplete="given-name" autocapitalize="words" maxlength="60"'), { req: 1, err: T('e_name') })}
       ${field('last_name', T('last_name'), inp('last_name', 'autocomplete="family-name" autocapitalize="words" maxlength="60"'), { req: 1, err: T('e_name') })}</div>` +
      field('dob', T('dob'), `<div class="row3">
        <select class="input" data-f="dob_d"><option value="">${esc(T('day'))}</option>${Array.from({length:31},(_,i)=>`<option ${+f.dob_d===i+1?'selected':''} value="${i+1}">${i+1}</option>`).join('')}</select>
        <select class="input" data-f="dob_m"><option value="">${esc(T('month'))}</option>${T('months').map((m,i)=>`<option ${+f.dob_m===i+1?'selected':''} value="${i+1}">${esc(m)}</option>`).join('')}</select>
        <select class="input" data-f="dob_y"><option value="">${esc(T('year'))}</option>${years.map(y=>`<option ${+f.dob_y===y?'selected':''} value="${y}">${L==='th'?y+543:y}</option>`).join('')}</select></div>`, { req: 1, err: T('e_dob') }) +
      field('phone', T('phone'), `<div class="phone-row"><select class="input" data-f="phone_cc">${CC.map(([c, n]) => `<option value="${c}" ${f.phone_cc === c ? 'selected' : ''}>${n.split(' ')[0]} ${c}</option>`).join('')}</select>
        ${inp('phone', `type="tel" inputmode="tel" autocomplete="tel-national" maxlength="20" placeholder="${esc(T('phone_ph'))}"`)}</div>`, { req: 1, err: T('e_phone') }) +
      field('email', T('email'), inp('email', 'type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="200" placeholder="name@example.com"'), { hint: T(PE() ? 'email_hint' : 'email_hint_np'), err: T('e_email') }) +
      `<div class="field marketing" data-field="marketing_consent">${chk('marketing_consent', esc(content(L).marketing.label))}<div class="hint">${esc(content(L).marketing.hint)}</div></div>` +
      field('preferred_contact', T(PE() ? 'pref' : 'pref_np'), `<div class="seg">${[['line','LINE'],['whatsapp','WhatsApp'],['email', T('email')]].map(([v, n]) => `<button class="${f.preferred_contact === v ? 'on' : ''}" data-act="pref" data-v="${v}">${esc(n)}</button>`).join('')}</div>`, { req: 1 });
    bar = `<button class="btn ghost" data-act="ci-cancel">×</button><div class="sp"></div><button class="btn primary" data-act="ci-next">${esc(T('next'))}</button>`;
  } else if (S.step === 2) {
    h = head(W() ? T('s2_title') : F.service_title) +
      field('services', C.service_today, `<div class="chips" data-group="services">${D.services.map(s => `<button class="chip ${f.services.includes(s.id) ? 'on' : ''}" data-act="multi" data-g="services" data-v="${s.id}">${esc(s[L])}</button>`).join('')}</div>
        <input class="input ${f.services.includes('other') ? '' : 'hidden'}" id="svc-other" style="margin-top:12px" data-f="service_other" maxlength="120" placeholder="${esc(T('other_ph'))}" value="${esc(f.service_other)}">`, { req: 1, err: T('e_service') }) +
      (askHealth() ? field('health_changed', F.health_q, `<div class="seg">${[['yes', F.health_yes], ['no', F.health_no]].map(([v, n]) => `<button class="${f.health_changed === v ? 'on' : ''}" data-act="health" data-v="${v}">${esc(n)}</button>`).join('')}</div>`
        + (f.health_changed === 'yes' ? `<div class="hint">${esc(F.health_yes_note)}</div>` : ''), { req: 1, err: F.e_health }) : '');
    if (W()) h +=
      `<div class="card"><h3>${esc(C.history_title)}</h3><p class="muted" style="margin-top:0">${esc(C.history_intro)}</p>` +
      field('allergy_items', '', `<div class="chips" data-group="allergy_items" style="grid-template-columns:1fr">${D.allergy_items.map(a => `<button class="chip ${f.allergy_items.includes(a.id) ? 'on' : ''}" data-act="multi" data-g="allergy_items" data-v="${a.id}">${esc(a[L])}</button>`).join('')}</div>`, { err: T('e_allergy') }) + `</div>` +
      field('prev_reaction', C.prev_q, `<div class="seg">${[['yes', C.yes], ['no', C.no]].map(([v, n]) => `<button class="${f.prev_reaction === v ? 'on' : ''}" data-act="prev" data-v="${v}">${esc(n)}</button>`).join('')}</div>`, { req: 1, err: T('e_prev') }) +
      field('known_allergies', C.known_label, `<textarea class="input" data-f="known_allergies" maxlength="1000">${esc(f.known_allergies)}</textarea>`);
    bar = backBtn + `<div class="sp"></div><button class="btn primary" data-act="ci-next">${esc(T('next'))}</button>`;
  } else if (S.step === 3 && !W() && !PE()) {   // returning client, no changes, no photos: signed health declaration only
    h = head(F.healthsign_title, F.healthsign_sub) + `<div class="card health-decl"><p class="declaration" style="margin:0">${esc(F.healthsign_text)}</p></div>` + sigBlock()
      + `<div class="card"><h3>${esc(content(L).nophoto.pdpa_title)}</h3><p class="small" style="margin:0;color:#5b4f44">${esc(content(L).nophoto.pdpa)}</p></div>`;
    bar = backBtn + `<div class="sp"></div><button class="btn clay" data-act="ci-submit">${esc(T('submit'))}</button>`;
  } else if (S.step === 3 && !W()) {   // returning client, no changes: photo consent, signed
    h = head(T('s4_title'), F.photosign_sub) + photoBlock() + sigBlock();
    bar = backBtn + `<div class="sp"></div><button class="btn clay" data-act="ci-submit">${esc(T('submit'))}</button>`;
  } else if (S.step === 3) {
    const today = fmtDate(todayISO(), L);
    h = head(T('s3_title'), T('s3_sub')) +
      `<div class="card" style="padding-top:8px;padding-bottom:8px">${C.sections.map(s => `<details class="acc"><summary>${esc(s.title)}</summary><p>${esc(s.body)}</p></details>`).join('')}
        <details class="acc" open><summary>${esc(C.important_title)}</summary><ul>${C.important.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details></div>` +
      `<div class="card"><h3>${esc(C.declaration_title)}</h3><p class="declaration">${esc(C.declaration)}</p></div>` +
      `<div class="field" data-field="confirms">${chk('confirm_declaration', esc(C.confirm_declaration))}${chk('confirm_disclosed', esc(C.confirm_disclosed))}<div class="err">${esc(T('e_confirm'))}</div></div>` +
      `<div class="row" style="grid-template-columns:2fr 1fr"><div class="label req">${esc(C.signature)}</div><div class="label" style="text-align:right">${esc(C.date_label || T('date_label'))}: <b style="color:var(--espresso)">${esc(today)}</b></div></div>
       <div class="field" data-field="signature"><div class="sigwrap" id="sigwrap"><canvas id="sig"></canvas><div class="ph">${esc(T('sign_here'))}</div><button class="btn small ghost clr" data-act="sig-clear">${esc(T('clear'))}</button></div><div class="err">${esc(T('e_sig'))}</div></div>
       <p class="muted small"><i>** ${esc(C.footer)} **</i></p>`;
    bar = backBtn + `<div class="sp"></div><button class="btn primary" data-act="ci-next">${esc(T('next'))}</button>`;
  } else if (S.step === 4 && !PE()) {
    const N = content(L).nophoto;
    h = head(N.title) + `<div class="card"><h3>${esc(N.pdpa_title)}</h3><p style="margin:0;color:#5b4f44">${esc(N.pdpa)}</p></div>`;
    bar = backBtn + `<div class="sp"></div><button class="btn clay" data-act="ci-submit">${esc(T('submit'))}</button>`;
  } else if (S.step === 4) {
    h = head(T('s4_title')) + photoBlock();
    bar = backBtn + `<div class="sp"></div><button class="btn clay" data-act="ci-submit">${esc(T('submit'))}</button>`;
  } else if (S.step === 5) {
    h = `<div class="step-head" style="text-align:center"><img src="${A}lb-logo-72@2x.png" style="width:72px" alt=""><h1 style="font-size:44px">${esc(T('add_title'))}</h1><p class="muted">${esc(T('add_sub'))}</p></div>
      <div class="scan-banner"><div class="big">${esc(T('add_scan'))}</div><div class="small muted">${esc(T('add_scan_sub'))}</div></div>
      <div class="qr-grid" id="addus-grid"></div>
      <div class="addus-msg hidden" id="addus-msg"></div>
      <p class="muted small" style="text-align:center">✉︎ ${esc(f.email ? T('add_email_note') : T('add_email_missing'))}</p>
      <div class="staff-box" lang="en"><div class="label">Staff only</div>
        <div class="hint">Manual note for now — these tick automatically once LINE / WhatsApp are connected (client's #code message arrives). Photos go to LINE/WhatsApp only for matched clients; email to everyone with an email.</div>
        ${chk('added_line', 'Client added us on <b>LINE</b>', 'added')}${chk('added_whatsapp', 'Client added us on <b>WhatsApp</b>', 'added')}</div>`;
    bar = `<div class="sp"></div><button class="btn primary" data-act="ci-finish">${esc(T('finish'))}</button><div class="sp"></div>`;
  } else if (S.step === 6) {
    h = `<div class="done-hero"><img src="${A}lb-logo.png" style="width:200px;margin-top:22vh" alt=""><h1 style="font-size:64px">${esc(T('thank_you'))}</h1><p class="muted">${esc(T('thank_sub'))}</p></div>`;
    bar = `<div class="sp"></div><button class="corner" style="position:static" data-act="done-next">Next client ›</button>`;
    clearTimeout(S.doneTimer); S.doneTimer = setTimeout(() => { if (S.step === 6 && !$('#scr-ci').classList.contains('hidden')) showPhotoChoice(false); }, 8000);
  }
  $('#ci-body').innerHTML = h; $('#ci-bar').innerHTML = bar; $('#ci-body').scrollTop = 0;
  setLang(S.lang);
  if (S.step === 3) initSig();
  if (S.step === 5) renderAddUs();
}

/* ---------------- personal add-us QR codes (generated on the iPad, work offline) ---------------- */
const enc = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());   // = Python quote(safe='')
function addUsMessage(lang, first, code) { const fn = (first || '').trim().split(/\s+/)[0] || ''; return (D.messages[lang] || D.messages.en).replace('{first_name}', fn).replace('{code}', code); }
function addUsLinks(msg) {
  const out = { whatsapp: `https://wa.me/${D.wa_e164.replace(/^\+/, '')}?text=${enc(msg)}` };
  if ((D.line_basic_id || '').startsWith('@')) { out.line = `https://line.me/R/oaMessage/${enc(D.line_basic_id)}/?${enc(msg)}`; out.line_mode = 'oamessage'; }
  else { out.line = D.line_add_url; out.line_mode = 'add_link'; }
  return out;
}
const QR_INK = '#4A3F35', QR_PAPER = '#FFFDF9';
function qrDataURL(text) {
  const q = LB_QR(0, text.length > 120 ? 'M' : 'H'); q.addData(text); q.make();
  const n = q.getModuleCount(), box = 10, border = 4, size = (n + border * 2) * box;
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d');
  g.fillStyle = QR_PAPER; g.fillRect(0, 0, size, size); g.fillStyle = QR_INK;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect((c + border) * box, (r + border) * box, box, box);
  return cv.toDataURL('image/png');
}
function renderAddUs() {
  const grid = $('#addus-grid'); if (!grid) return;
  const msg = addUsMessage(S.lang, S.f.first_name, S.addCode), L = addUsLinks(msg);
  const lineSub = L.line_mode === 'oamessage' ? T('add_line_sub') : T('add_line_manual');
  grid.innerHTML =
    `<div class="qr-card"><img class="qr" data-qr="line" data-url="${esc(L.line)}" src="${qrDataURL(L.line)}" alt="LINE QR"><div class="nm">LINE</div><div class="muted small">${esc(lineSub)}</div></div>
     <div class="qr-card"><img class="qr" data-qr="whatsapp" data-url="${esc(L.whatsapp)}" src="${qrDataURL(L.whatsapp)}" alt="WhatsApp QR"><div class="nm">WhatsApp</div><div class="muted small">${esc(T('add_wa_sub'))}<br>${esc(D.wa_display)}</div></div>`;
  const m = $('#addus-msg'); m.classList.remove('hidden');
  m.innerHTML = `<span class="lbl">${esc(T('add_msg_label'))}</span> <span class="txt">“${esc(msg)}”</span>`;
}

/* signature pad */
let sigCtx;
function initSig() {
  const cv = $('#sig'), wrap = $('#sigwrap'), dpr = window.devicePixelRatio || 1;
  const r = wrap.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr;
  sigCtx = cv.getContext('2d'); sigCtx.scale(dpr, dpr); sigCtx.lineCap = sigCtx.lineJoin = 'round'; sigCtx.strokeStyle = '#2E2620'; sigCtx.lineWidth = 2.6;
  if (S.f.signature) { const im = new Image(); im.onload = () => sigCtx.drawImage(im, 0, 0, r.width, r.height); im.src = S.f.signature; }
  let drawing = false, last = null;
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.onpointerdown = e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); sigCtx.beginPath(); sigCtx.arc(last[0], last[1], 1.2, 0, 7); sigCtx.fillStyle = '#2E2620'; sigCtx.fill(); };
  cv.onpointermove = e => { if (!drawing) return; const p = pos(e); sigCtx.lineWidth = e.pressure && e.pointerType === 'pen' ? 1.5 + e.pressure * 2.5 : 2.6;
    sigCtx.beginPath(); sigCtx.moveTo(...last); sigCtx.lineTo(...p); sigCtx.stroke(); last = p; };
  cv.onpointerup = cv.onpointercancel = () => { if (!drawing) return; drawing = false; S.f.signature = cv.toDataURL('image/png'); $('#sigwrap').classList.remove('invalid'); $('[data-field=signature]').classList.remove('invalid'); };
}

function setInvalid(key, bad) { const el = $(`[data-field="${key}"]`); if (el) el.classList.toggle('invalid', !!bad); return !bad; }
function validDob(f) { const d = +f.dob_d, m = +f.dob_m, y = +f.dob_y; if (!d || !m || !y) return null;
  const dt = new Date(Date.UTC(y, m - 1, d)); if (dt.getUTCDate() !== d || dt.getUTCMonth() !== m - 1) return null;
  const now = new Date(); let age = now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0);
  if (age < 10 || age > 110) return null; return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function validPhone(cc, p) { const d = (p || '').replace(/[\s\-().]/g, ''); if (!/^\d+$/.test(d)) return false;
  if (cc === '+66') { let x = d.replace(/^66/, '').replace(/^0/, ''); return x.length === 8 || x.length === 9; } const x = d.replace(/^0+/, ''); return x.length >= 6 && x.length <= 13; }
function validateStep() {
  const f = S.f; let ok = true;
  const nameRe = /^[^\d<>{}\[\]\\\/@#$%^*=+_|~`"]{1,60}$/;
  if (S.step === 1) {
    ok &= setInvalid('first_name', !nameRe.test(f.first_name.trim()));
    ok &= setInvalid('last_name', !nameRe.test(f.last_name.trim()));
    ok &= setInvalid('dob', !validDob(f));
    ok &= setInvalid('phone', !validPhone(f.phone_cc, f.phone));
    const emailOk = !f.email.trim() || /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(f.email.trim());
    const emailNeeded = f.preferred_contact === 'email' && !f.email.trim();
    const mktNeedsEmail = f.marketing_consent === true && !f.email.trim();   // ticked "news and offers" but no email
    $('[data-field=email] .err').textContent = emailNeeded ? T(PE() ? 'e_email_pref' : 'e_email_pref_np') : mktNeedsEmail ? T('e_email_mkt') : T('e_email');
    ok &= setInvalid('email', !emailOk || emailNeeded || mktNeedsEmail);
    ok &= setInvalid('preferred_contact', !f.preferred_contact);
  } else if (S.step === 2) {
    const otherBad = f.services.includes('other') && !f.service_other.trim();
    $('[data-field=services] .err').textContent = otherBad ? T('e_other') : T('e_service');
    ok &= setInvalid('services', !f.services.length || otherBad);
    if (askHealth()) ok &= setInvalid('health_changed', !f.health_changed);
    if (W()) { ok &= setInvalid('allergy_items', !f.allergy_items.length);
      ok &= setInvalid('prev_reaction', !f.prev_reaction); }
  } else if (S.step === 3 && !W()) {
    if (PE()) ok &= setInvalid('photo_consent', !f.photo_consent);
    ok &= setInvalid('signature', !f.signature); $('#sigwrap').classList.toggle('invalid', !f.signature);
  } else if (S.step === 3) {
    ok &= setInvalid('confirms', !(f.confirm_declaration && f.confirm_disclosed));
    $$('[data-act=chk]').forEach(el => el.classList.toggle('invalid', !S.f[el.dataset.k]));
    ok &= setInvalid('signature', !f.signature); $('#sigwrap').classList.toggle('invalid', !f.signature);
  } else if (S.step === 4 && PE()) {
    ok &= setInvalid('photo_consent', !f.photo_consent);
  }
  if (!ok) { toast(T('e_fix')); $('.field.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  return !!ok;
}
async function submitCheckin(btn) {
  if (!validateStep()) return;
  const f = S.f; btn.disabled = true; btn.textContent = T('sending');
  const vid = newId(), code = PE() ? newCode() : null, now = new Date().toISOString();
  const payload = {
    visit_id: vid, add_code: code, checked_in_at: now, consent_version: D.consent_version,
    lang: S.lang, branch: S.branch, first_name: f.first_name.trim(), last_name: f.last_name.trim(), dob: validDob(f),
    phone_cc: f.phone_cc, phone: f.phone, email: f.email.trim() || null, preferred_contact: f.preferred_contact,
    services: f.services, service_other: f.service_other || null,
    // forms signed this visit (gas-1.3.0): without the waiver no allergy answers are sent at all
    visit_type: RET() ? 'returning' : 'first', forms: { allergy_waiver: W(), health_declaration: askHealth() && f.health_changed === 'no' && !W(), photo_consent: PE() }, health_changed: askHealth() ? f.health_changed : null,
    allergy_items: W() ? f.allergy_items : [], prev_reaction: W() ? f.prev_reaction : null,
    known_allergies: W() ? (f.known_allergies || null) : null, confirm_declaration: W() && f.confirm_declaration, confirm_disclosed: W() && f.confirm_disclosed,
    signature: f.signature, promo_consent: PE() && f.promo_consent, marketing_consent: f.marketing_consent === true, photo_style: PE() ? f.photo_style : 'natural',
    photos_enabled: PE(), photo_skip_reason: PE() ? null : S.photos.reason, photo_consent: PE() && f.photo_consent,
    device: (navigator.userAgent || '').slice(0, 200) };
  try {
    // Saved on the iPad first (IndexedDB), then sent; if Wi-Fi is down it is retried automatically.
    await DB.put('visits', { id: vid, first_name: payload.first_name, last_name: payload.last_name, services: payload.services, service_other: payload.service_other,
      lang: S.lang, branch: S.branch, visit_date: todayISO(), checked_in_at: now, photos_enabled: PE(), photo_skip_reason: payload.photo_skip_reason,
      photo_consent: payload.photo_consent, add_code: code, photos: {}, synced: false });
    await enqueue('checkin', vid, payload);
  } catch (e) { toast(T('saved_err') + ' (' + (e.message || e) + ')', 4000); btn.disabled = false; btn.textContent = T('submit'); return; }
  S.visitId = vid; S.addCode = code; S.f.added_line = false; S.f.added_whatsapp = false; S.step = PE() ? 5 : 6; renderStep();
}

/* example gallery lightbox (bundled images) */
function openExamples() {
  const images = D.examples.map(n => A + 'lb-ex-' + n);
  $('#modal-root').innerHTML = `<div class="modal" data-act="modal-bg"><div class="box" lang="${S.lang}"><button class="close" data-act="close-modal" aria-label="Close">×</button>
    <div class="gallery" id="gal">${images.map(u => `<img src="${esc(u)}" alt="">`).join('')}</div>
    ${images.length > 1 ? '<button class="gal-nav prev" data-act="gal" data-d="-1">‹</button><button class="gal-nav next" data-act="gal" data-d="1">›</button>' : ''}
    <div class="gal-foot"><div class="cap">${esc(T('example_caption'))}</div><div class="gal-dots">${images.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div></div></div>`;
  const g = $('#gal'); g.onscroll = () => { const i = Math.round(g.scrollLeft / g.clientWidth); $$('.gal-dots i').forEach((d, j) => d.classList.toggle('on', i === j)); };
}

/* ---------------- Photo chair ---------------- */
const has = (v, k) => !!(v.photos && v.photos[k]);
const hhmm = iso => { try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }); } catch { return ''; } };
function whoTook(v, k) {   // "Fern iPhone 10:41" / "this phone 10:41" / '' (gas-1.2.0 upload, or still uploading)
  const b = v.photo_by && v.photo_by[k]; if (!b) return '';
  const me = b.device_id && b.device_id === device().id;
  return [me ? 'this ' + devKind().toLowerCase() : (b.device_name || ''), b.taken_at ? hhmm(b.taken_at) : ''].filter(Boolean).join(' ');
}
const otherTook = (v, k) => { const b = v.photo_by && v.photo_by[k]; return has(v, k) && v.photos[k] !== 'pending' && b && b.device_id !== device().id ? whoTook(v, k) || 'another device' : ''; };
// switching to Check-in kiosk: nothing of the client list may stay on the screen or in this device's storage
function clearCameraData() { stopCam(); S.visits = []; S.card = null; S.notes = []; S.chairAt = null; LS.del('lb_chair_cache');
  ['#chair-body', '#namecard', '#card-bar'].forEach(q => { const e = $(q); if (e) e.innerHTML = ''; }); }
// photos only for visits that finished check-in with a SIGNED consent (consent.pdf in Drive) and photo consent = yes.
// Server rows carry consent_ok (gas-1.3.0); this device's own check-ins were signed here before they could be saved.
const photoReady = v => !!(v.photos_enabled && v.photo_consent && (v.local || v.consent_ok !== false));
function openChair() { if (role() !== 'camera') return show('home'); show('chair'); if (!S.visits.length) $('#chair-body').innerHTML = '<p class="muted">Loading…</p>'; return loadChair(); }
let chairBusy = null;
async function loadChair() {
  if (role() !== 'camera') return;          // kiosk: never asks for the client list
  if (chairBusy) return chairBusy;          // focus + timer + pull can fire together: one request at a time
  chairBusy = loadChair_().finally(() => { chairBusy = null; });
  return chairBusy;
}
async function loadChair_() {
  $('#chair-branch').textContent = branchName(S.branch);
  const today = todayISO();
  const local = (await DB.all('visits').catch(() => [])).filter(v => v.visit_date === today && v.branch === S.branch);
  let server = [];
  try { server = (await gas('chair', { branch: S.branch, date: today, device_role: role() }, { timeout: 20000 })).visits || []; S.chairOffline = false;
    S.chairAt = new Date().toISOString(); LS.set('lb_chair_cache', { date: today, branch: S.branch, at: S.chairAt, visits: server }); }
  catch (e) { S.chairOffline = e instanceof NetError ? 'offline' : (e.code || 'error');
    const cc = LS.get('lb_chair_cache', null);   // camera phones have no check-ins of their own: show the last list from today
    if (cc && cc.date === today && cc.branch === S.branch) { server = cc.visits || []; S.chairCacheAt = cc.at; } else S.chairCacheAt = null; }
  const byId = new Map(server.map(v => [v.id, { ...v, photos: { ...(v.photos || {}) } }]));
  for (const lv of local) {   // add check-ins still in the queue + photos still uploading
    const sv = byId.get(lv.id);
    if (!sv) byId.set(lv.id, { ...lv, local: !lv.synced });
    else { for (const k of Object.keys(lv.photos || {})) if (lv.photos[k] === 'pending') sv.photos[k] = 'pending';
      if (lv.local_toggle_at && lv.local_toggle_at > (lv.synced_toggle_at || '')) { sv.photos_enabled = lv.photos_enabled; sv.photo_skip_reason = lv.photo_skip_reason; sv.add_code = lv.add_code || sv.add_code; } }
  }
  S.visits = [...byId.values()].filter(v => v.photos_enabled || v.photo_consent).sort((a, b) => (b.checked_in_at || '').localeCompare(a.checked_in_at || ''));
  if (visible('chair')) renderChair();
  if (S.card && visible('card')) { const nv = S.visits.find(x => x.id === S.card.v.id); if (nv) { S.card.v = nv; renderCard(); } }
}
// a photo upload reported back: another phone's newer photo was kept, or this one replaced another phone's
function photoNotice(it, res) {
  if (!res || !(res.superseded || res.replaced)) return;
  const v = S.visits.find(x => x.id === it.vid), fn = (v && v.first_name) || 'Client', kind = it.payload.kind;
  const o = res.superseded ? res.current : res.replaced, who = (o && o.device_name) || 'another device', at = o && o.taken_at ? ' (' + hhmm(o.taken_at) + ')' : '';
  const msg = res.superseded ? `${fn} · ${kind}: ${who} took a newer photo${at}; that one is kept. This photo is in Drive trash.`
    : `${fn} · ${kind}: replaced the photo from ${who}${at}.`;
  S.notes = [...(S.notes || []), msg].slice(-5); toast(msg, 5000); if (visible('chair')) renderChair();
}
// staff screens show the FIRST NAME only (PDPA); the time, services and add-us code tell two "Anna"s apart
function clientRow(v, prio) {
  const ini = (v.first_name || '').trim().charAt(0);
  const t = v.checked_in_at ? hhmm(v.checked_in_at) : '';
  const pill = (k, cls, label) => { if (!has(v, k)) return k === 'before' ? '<span class="pill">No before</span>' : '';
    if (v.photos[k] === 'pending') return `<span class="pill ${cls}">${label} ⟳ uploading</span>`;
    const w = whoTook(v, k); return `<span class="pill ${cls}">${label} ✓${w ? ' · ' + esc(w) : ''}</span>`; };
  return `<button class="client-row ${prio ? 'prio' : ''}" data-act="open-card" data-id="${v.id}"><div class="av">${esc(ini.toUpperCase())}</div>
    <div><div class="nm">${esc(v.first_name)}${v.local ? '<span class="local-tag">ON THIS DEVICE</span>' : ''}</div><div class="meta">${esc(v.services.map(s => svcName(s, 'en')).join(' · '))} · ${t} · ${v.lang.toUpperCase()}${v.add_code ? ' · #' + esc(v.add_code) : ''}</div></div>
    <div class="st">${pill('before', 'sage', 'Before')}${pill('after', 'clay', 'After')}</div></button>`;
}
const REASON = r => r ? (D.photo_skip_reasons[r] || r) : '';
function offRow(v) {
  const ini = (v.first_name || '').trim().charAt(0);
  return `<div class="row-wrap"><div class="client-row off"><div class="av">${esc(ini.toUpperCase())}</div>
    <div><div class="nm">${esc(v.first_name)}</div><div class="meta">${esc(v.services.map(s => svcName(s, 'en')).join(' · '))}</div></div>
    <div class="st" style="flex-direction:column;align-items:flex-end;gap:8px"><span class="pill stone">No photos${v.photo_skip_reason ? ' · ' + esc(REASON(v.photo_skip_reason)) : ''}</span>
    ${v.photo_consent ? `<button class="mini" data-act="photos-on" data-id="${v.id}">Turn photos on</button>` : '<button class="mini" disabled title="Client did not give photo consent at check-in">Needs client consent</button>'}</div></div></div>`;
}
async function photosToggle(id, enabled, reason = null) {
  const v = S.visits.find(x => x.id === id) || (await DB.get('visits', id)); if (!v) return;
  if (enabled && !v.photo_consent) { toast('Needs client consent', 3000); return; }
  const code = enabled ? (v.add_code || newCode()) : v.add_code;
  const lv = (await DB.get('visits', id)) || { ...v, synced: true };
  Object.assign(lv, { photos_enabled: enabled, photo_skip_reason: enabled ? null : reason, add_code: code, local_toggle_at: new Date().toISOString() });
  await DB.put('visits', lv);
  await enqueue('photos_enabled', id, { visit_id: id, enabled, reason: enabled ? null : reason, add_code: code });
  toast(enabled ? 'Photos switched on' : 'Photos switched off'); show('chair'); await loadChair();
}
function photosOffPrompt(id) {
  $('#modal-root').innerHTML = `<div class="modal"><div class="box" style="padding:36px;width:min(620px,100%)"><button class="close" data-act="close-modal">×</button>
    <div class="eyebrow">Staff only</div><h2>No photos for this client?</h2><p class="muted">They will leave the photo queue and won't be sent photos. Existing photos stay in Drive.</p>
    <div class="label">Reason (optional)</div><div class="reason-chips">${Object.entries(D.photo_skip_reasons).filter(([k]) => k !== 'staff').map(([k, n]) => `<button data-act="off-reason" data-v="${k}">${esc(n)}</button>`).join('')}</div>
    <button class="btn clay" style="width:100%;margin-top:26px" data-act="off-confirm" data-id="${id}">Switch photos off</button></div></div>`;
}
function renderChair() {
  const all = S.visits, tab = S.chairTab, vs = all.filter(photoReady), off = all.filter(v => !v.photos_enabled),
    wait = all.filter(v => v.photos_enabled && !photoReady(v));
  // (visits with photos off AND no photo consent never reach this list: filtered by the server and in loadChair)
  const cached = S.chairCacheAt ? ` the list from ${hhmm(S.chairCacheAt)}` : ' only what this device knows';
  let h = (S.chairOffline ? `<div class="offline-banner">${S.chairOffline === 'offline' ? `Offline — showing${cached}. Photos are saved on this device and upload when the connection is back.` : 'Could not load the list from Google (' + esc(S.chairOffline) + `). Showing${cached}.`}</div>` : '') +
    (S.notes || []).map((n, i) => `<div class="note-banner"><span>${esc(n)}</span><button class="mini" data-act="note-ok" data-i="${i}">OK</button></div>`).join('') +
    `<div class="pull-hint" id="pull-hint">Release to refresh</div>
    <div class="eyebrow">${esc(fmtDate(todayISO(), 'en'))}${S.chairAt ? ` · updated ${esc(hhmm(S.chairAt))}` : ''}</div><h1>Today's clients</h1>
    <div class="tabs"><button class="${tab === 'before' ? 'on' : ''}" data-act="chair-tab" data-v="before">Before</button><button class="${tab === 'after' ? 'on' : ''}" data-act="chair-tab" data-v="after">After</button></div>`;
  if (!all.length) h += `<div class="empty">No clients checked in yet today at ${esc(branchName(S.branch))}.</div>`;
  else if (!vs.length) h += `<div class="empty">No clients with photos today.</div>`;
  else if (tab === 'before') {
    const need = vs.filter(v => !has(v, 'before')), done = vs.filter(v => has(v, 'before'));
    if (need.length) h += `<div class="eyebrow sect-label">Waiting for before photo</div>` + need.map(v => clientRow(v, true)).join('');
    if (done.length) h += `<div class="eyebrow sect-label">Before taken</div>` + done.map(v => clientRow(v)).join('');
  } else {
    const need = vs.filter(v => has(v, 'before') && !has(v, 'after')), rest = vs.filter(v => !(has(v, 'before') && !has(v, 'after')));
    h += `<div class="eyebrow sect-label">Ready for after photo</div>` + (need.length ? need.map(v => clientRow(v, true)).join('') : '<div class="empty" style="padding:20px">Nobody waiting.</div>');
    if (rest.length) h += `<div class="eyebrow sect-label">Others</div>` + rest.map(v => clientRow(v)).join('');
  }
  if (wait.length) h += `<div class="eyebrow sect-label">Waiting for signed consent</div>` + wait.map(v => `<div class="client-row off wait"><div class="av">${esc((v.first_name || '').trim().charAt(0).toUpperCase())}</div>
    <div><div class="nm">${esc(v.first_name)}</div><div class="meta">${v.photo_consent ? 'Consent not saved yet — the client finishes on the iPad, then tap Refresh.' : 'No photo consent from the client.'}</div></div>
    <div class="st"><span class="pill stone">No photos yet</span></div></div>`).join('');
  if (off.length) h += `<div class="eyebrow sect-label">No photos</div>` + off.map(offRow).join('');
  $('#chair-body').innerHTML = h;
}
function openCard(id, kind) {
  if (role() !== 'camera') return;
  const v = S.visits.find(x => x.id === id); if (!v || !photoReady(v)) return;   // no signed consent → no card, no camera
  S.card = { v, kind: kind || (S.chairTab === 'after' ? 'after' : 'before') }; S.lang = v.lang; renderCard(); show('card');
}
const thumbURLs = [];
async function renderCard() {
  const { v, kind } = S.card, L = v.lang, I = I18N[L];
  const svc = v.services.map(s => s === 'other' && v.service_other ? v.service_other : svcName(s, L)).join(' · ');
  $('#namecard').innerHTML = `<img class="logo" src="${A}lb-logo.png" alt=""><div class="brand">Lashes Boudoir</div>
    <div class="kind ${kind}">${esc(I['kind_' + kind])}</div>
    <div class="name">${esc(v.first_name)}</div><div class="svc">${esc(svc)}</div>
    <div class="rule"></div><div class="meta">${esc(branchName(v.branch, L))} · ${esc(fmtDate(v.visit_date, L))}</div>`;
  thumbURLs.splice(0).forEach(u => URL.revokeObjectURL(u));
  const kinds = ['before', 'after', 'namecard'].filter(k => has(v, k));
  const thumbs = [];
  for (const k of kinds) {
    const t = await DB.get('thumbs', v.id + ':' + k).catch(() => null);
    const inner = t ? `<img src="${(u => (thumbURLs.push(u), u))(URL.createObjectURL(t.blob))}" alt="">` : `<span class="ondrive">IN DRIVE</span>`;
    thumbs.push(`<div class="thumb">${inner}<span class="k">${k}${v.photos[k] === 'pending' ? ' ⟳' : ''}</span><button class="x" data-act="del-photo" data-kind="${k}">×</button></div>`);
  }
  const ot = otherTook(v, kind), warn = $('#card-warn');
  warn.textContent = ot ? `${kind === 'after' ? 'After' : 'Before'} already taken by ${ot}. A new photo replaces it (the newest photo is kept).` : '';
  warn.classList.toggle('hidden', !ot);
  $('#card-bar').innerHTML = `<button class="btn" data-act="chair-back">‹ List</button>
    <div class="seg" style="width:260px"><button class="${kind === 'before' ? 'on' : ''}" data-act="card-kind" data-v="before" style="min-height:56px">Before</button><button class="${kind === 'after' ? 'on' : ''}" data-act="card-kind" data-v="after" style="min-height:56px">After</button></div>
    <div class="thumbs">${thumbs.join('') || '<span class="small" style="opacity:.6">No photos yet</span>'}</div>
    <button class="btn small" data-act="photos-off" data-id="${v.id}" title="Switch photos off for this client">No photos</button>
    ${S.settings.namecardPhoto ? '<button class="btn small" data-act="capture" data-kind="namecard">Name card photo</button>' : ''}
    <button class="capture" data-act="capture" data-kind="${kind}" aria-label="Take photo">${has(v, kind) ? 'RETAKE' : 'PHOTO'}</button>`;
  $$('#scr-card .seg button').forEach(b => { b.style.color = b.classList.contains('on') ? 'var(--espresso)' : 'var(--cream)'; b.style.background = b.classList.contains('on') ? 'var(--cream)' : 'transparent'; b.style.borderColor = 'var(--cream)'; });
}
let captureKind = 'before';
function capture(kind) { openCapture(kind); }
// "Camera app": the phone's own camera via <input capture>; the original JPEG is kept (see keepOriginalJpeg)
function nativeCamera(kind) { if (role() !== 'camera') return; captureKind = kind || captureKind; const cam = $('#cam'); cam.setAttribute('capture', S.settings.facing); cam.value = ''; cam.click(); }

/* ---- live capture screen: main rear lens, highest resolution the browser allows, eye guides ---- */
let camStream = null, camTrack = null, camGen = 0;
function stopCam() { camGen++; if (camStream) camStream.getTracks().forEach(t => { try { t.stop(); } catch {} }); camStream = camTrack = null;
  const vd = R && $('#cap-video'); if (vd) vd.srcObject = null; }
function openCapture(kind) {
  if (role() !== 'camera' || !S.card || !photoReady(S.card.v)) return;
  captureKind = kind; const v = S.card.v, ot = otherTook(v, kind);
  $('#cap-title').textContent = `${v.first_name} · ${kind === 'namecard' ? 'NAME CARD' : kind.toUpperCase()}`;
  $('#cap-kind').className = 'cap-kind ' + kind; $('#cap-res').textContent = '';
  const w = $('#cap-warn'); w.textContent = ot ? `Already taken by ${ot} — this photo replaces it.` : ''; w.classList.toggle('hidden', !ot);
  show('capture'); startCam();
}
const camWant = extra => ({ audio: false, video: { width: { ideal: 4032 }, height: { ideal: 3024 }, ...extra } });
async function mainRearCamera(track) {   // iPhone Pro: prefer "Back Camera" (main 1x lens) over Ultra Wide / Telephoto / Dual / Triple
  try {
    const cur = track.getSettings ? track.getSettings().deviceId : null;
    const back = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput' && /back|rear|environment/i.test(d.label || ''));
    const main = back.find(d => /^back camera$/i.test(d.label.trim())) || back.find(d => !/ultra|tele|dual|triple|wide|depth|infra|desk/i.test(d.label));
    return main && main.deviceId && main.deviceId !== cur ? main.deviceId : null;
  } catch { return null; }
}
async function maxResolution(t) {
  try {
    const c = t.getCapabilities ? t.getCapabilities() : null, s = t.getSettings();
    if (c && c.width && c.height && c.width.max * c.height.max > (s.width || 0) * (s.height || 0))
      await t.applyConstraints({ width: { ideal: c.width.max }, height: { ideal: c.height.max } });
    if (c && Array.isArray(c.focusMode) && c.focusMode.includes('continuous')) await t.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
  } catch {}
}
async function startCam() {
  const gen = ++camGen, msg = $('#cap-msg'), btn = $('#cap-shoot'), vid = $('#cap-video');
  btn.disabled = true; msg.textContent = 'Starting camera…';
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = 'Live camera is not available here — tap "Camera app".'; return; }
  const facing = S.settings.facing || 'environment';
  let s = null;
  try {
    s = await navigator.mediaDevices.getUserMedia(camWant({ facingMode: { ideal: facing } }));
    if (facing === 'environment') { const main = await mainRearCamera(s.getVideoTracks()[0]);
      if (main) { s.getTracks().forEach(t => t.stop()); s = null;
        try { s = await navigator.mediaDevices.getUserMedia(camWant({ deviceId: { exact: main } })); }
        catch { s = await navigator.mediaDevices.getUserMedia(camWant({ facingMode: { ideal: facing } })); } } }
  } catch (e) {
    if (s) s.getTracks().forEach(t => t.stop());
    msg.textContent = e && e.name === 'NotAllowedError' ? 'Camera not allowed. Allow the camera for this page (iPhone Settings › Apps › Safari › Camera), or tap "Camera app".'
      : 'Live camera could not start (' + ((e && (e.name || e.message)) || 'error') + ') — tap "Camera app".';
    return;
  }
  if (gen !== camGen) { s.getTracks().forEach(t => t.stop()); return; }   // left the screen meanwhile
  camStream = s; camTrack = s.getVideoTracks()[0];
  await maxResolution(camTrack);
  vid.srcObject = s; vid.muted = true; vid.setAttribute('playsinline', ''); try { await vid.play(); } catch {}
  for (let i = 0; i < 50 && !vid.videoWidth; i++) await new Promise(r => setTimeout(r, 100));
  if (gen !== camGen) return;
  layoutCapture(); msg.textContent = ''; btn.disabled = false;
  $('#cap-res').textContent = vid.videoWidth ? `${vid.videoWidth}×${vid.videoHeight}` : '';
}
// the preview shows exactly the captured frame (contain, no crop); guides are drawn on top in the same box
function layoutCapture() {
  const vid = $('#cap-video'), view = $('#cap-view'), fr = $('#cap-frame'); if (!vid || !view || !vid.videoWidth) return;
  const W = view.clientWidth, H = view.clientHeight, ar = vid.videoWidth / vid.videoHeight;
  let w = W, h = W / ar; if (h > H) { h = H; w = H * ar; }
  fr.style.width = Math.round(w) + 'px'; fr.style.height = Math.round(h) + 'px'; drawGuides(w, h);
}
function drawGuides(w, h) {
  const g = $('#cap-guides'); if (!g) return;
  const y = h * 0.47, ew = Math.min(w * 0.3, h * 0.42), eh = ew * 0.36, cx = [w * 0.31, w * 0.69];
  const eye = x => `<path d="M ${x - ew / 2} ${y} Q ${x} ${y - eh * 1.25} ${x + ew / 2} ${y} Q ${x} ${y + eh * 0.95} ${x - ew / 2} ${y} Z"/>` +
    `<circle cx="${x}" cy="${y + eh * 0.04}" r="${eh * 0.34}" class="iris"/>`;
  g.setAttribute('viewBox', `0 0 ${w} ${h}`);
  g.innerHTML = `<line x1="${w * 0.06}" y1="${y}" x2="${w * 0.94}" y2="${y}" class="level"/><line x1="${w / 2}" y1="${y - eh}" x2="${w / 2}" y2="${y + eh}" class="level"/>` +
    eye(cx[0]) + eye(cx[1]) + `<text x="${w / 2}" y="${Math.min(h - 14, y + eh * 2.6)}" text-anchor="middle">Both eyes in the guides · same distance for Before &amp; After</text>`;
}
async function shoot() {
  if (!camTrack || $('#cap-shoot').disabled) return;
  const vid = $('#cap-video'), btn = $('#cap-shoot'); btn.disabled = true;
  const fl = $('#cap-flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
  let blob = null, ready = false;
  try { if ('ImageCapture' in window) blob = await new ImageCapture(camTrack).takePhoto(); } catch { blob = null; }   // full sensor photo where supported
  if (!blob || blob.size < 1000) {   // Safari: grab the video frame at the stream's full resolution
    const w = vid.videoWidth, h = vid.videoHeight, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); if (g) { g.drawImage(vid, 0, 0, w, h); blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', D.photo.quality)); ready = true; }
    cv.width = cv.height = 0;
  }
  stopCam(); show('card');
  if (!blob) { toast('Could not take the photo — try "Camera app"', 4000); return; }
  await onCaptured(blob, { ready, source: 'live' });
}

/* Camera-app photos: keep the ORIGINAL JPEG bytes (full resolution, no re-compression). Removed: Exif/XMP (GPS, device,
   time), comments, and any second image after the main one (HDR gain map / MPF). Kept: colour profile (ICC) and an
   orientation-only Exif so the photo still shows upright. Returns null when the file is not a plain JPEG → re-encode instead. */
function exifOrientation(seg) {
  try {
    if (String.fromCharCode(...seg.subarray(4, 10)) !== 'Exif\0\0') return 0;
    const t = seg.subarray(10), le = t[0] === 0x49, u16 = o => le ? t[o] | (t[o + 1] << 8) : (t[o] << 8) | t[o + 1];
    const u32 = o => le ? (t[o] | (t[o + 1] << 8) | (t[o + 2] << 16)) + t[o + 3] * 16777216 : t[o] * 16777216 + ((t[o + 1] << 16) | (t[o + 2] << 8) | t[o + 3]);
    const ifd = u32(4), n = u16(ifd);
    for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12; if (u16(e) === 0x0112) { const o = u16(e + 8); return o >= 1 && o <= 8 ? o : 0; } }
  } catch {}
  return 0;
}
const exifWithOrientation = o => new Uint8Array([0xFF, 0xE1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0, 0, 0x4D, 0x4D, 0x00, 0x2A, 0, 0, 0, 8,
  0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, o, 0, 0, 0, 0, 0, 0]);
async function keepOriginalJpeg(file, w, h) {
  try {
    if (!file || file.size > D.photo.max_bytes || !/jpe?g/i.test(file.type || '')) return null;
    const b = new Uint8Array(await file.arrayBuffer()); if (b[0] !== 0xFF || b[1] !== 0xD8) return null;
    const out = [b.subarray(0, 2)]; let i = 2, orient = 0;
    while (i + 4 <= b.length) {
      if (b[i] !== 0xFF) return null;
      const m = b[i + 1]; if (m === 0xFF) { i++; continue; }
      if (m === 0xDA) {   // start of scan: copy up to the end of the main image (EOI); anything after it is dropped
        let j = i + 2 + ((b[i + 2] << 8) | b[i + 3]);
        while (j + 1 < b.length && !(b[j] === 0xFF && b[j + 1] === 0xD9)) j++;
        if (j + 1 >= b.length) return null;
        out.push(b.subarray(i, j + 2)); break;
      }
      const len = (b[i + 2] << 8) | b[i + 3], seg = b.subarray(i, i + 2 + len); if (len < 2 || i + 2 + len > b.length) return null;
      const sig = String.fromCharCode(...seg.subarray(4, Math.min(16, seg.length)));
      if (m === 0xE1) { orient = exifOrientation(seg) || orient; }                  // Exif / XMP: dropped
      else if (m === 0xE2 && !sig.startsWith('ICC_PROFILE')) {}                       // MPF etc.: dropped
      else if ((m >= 0xE3 && m <= 0xEF) || m === 0xFE) {}                            // other app data, comments: dropped
      else out.push(seg);                                                             // JFIF, ICC, tables, frame header
      i += 2 + len;
    }
    if (out.length < 3) return null;
    if (orient > 1) out.splice(1, 0, exifWithOrientation(orient));
    return { blob: new Blob(out, { type: 'image/jpeg' }), width: w, height: h, original: true };
  } catch { return null; }
}
function loadImage(file) { return new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image();
  im.onload = () => { URL.revokeObjectURL(u); res(im); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('not an image')); }; im.src = u; }); }
function toJpeg(src, w, h, maxEdge, q) {   // <img> decoding applies the EXIF orientation; re-encoding drops EXIF (no GPS in Drive)
  const s = Math.min(1, maxEdge / Math.max(w, h), Math.sqrt(16e6 / (w * h))), W = Math.round(w * s), H = Math.round(h * s);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  if (!g) return Promise.resolve({ blob: null, width: W, height: H });   // canvas too large for this device
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(src, 0, 0, W, H);
  return new Promise(res => cv.toBlob(b => { cv.width = cv.height = 0; res({ blob: b, width: W, height: H }); }, 'image/jpeg', q));   // free canvas memory (iOS)
}
// Full camera resolution (capped at D.photo.max_edge, JPEG D.photo.quality). Falls back to a lighter encode only if the
// device cannot make a canvas that big or the file would exceed the upload limit (D.photo.max_bytes).
async function toUploadJpeg(im, w, h) {
  const P = D.photo, tries = [[P.max_edge, P.quality], [P.max_edge, 0.85], [3200, 0.85], [2400, 0.9]];
  let last = null;
  for (const [edge, q] of tries) {
    try { last = await toJpeg(im, w, h, edge, q); } catch (e) { last = null; }
    if (last && last.blob && last.blob.size <= P.max_bytes) return last;
  }
  if (last && last.blob) return last;
  throw new Error('photo too large for this device');
}
async function onCaptured(file, opts = {}) {
  if (!file || !S.card || role() !== 'camera' || !photoReady(S.card.v)) return; const v = S.card.v, kind = captureKind; toast('Saving…', 1200);
  try {
    const im = await loadImage(file), w = im.naturalWidth, h = im.naturalHeight;
    const big = (opts.ready && file.size <= D.photo.max_bytes ? { blob: file, width: w, height: h } : null)   // live frame, already a full-size JPEG
      || (opts.source === 'live' ? null : await keepOriginalJpeg(file, w, h))                              // camera app: original bytes
      || await toUploadJpeg(im, w, h);
    const th = await toJpeg(im, w, h, 480, 0.8);
    await DB.put('thumbs', { key: v.id + ':' + kind, blob: th.blob });
    // a retake replaces a photo that has not been uploaded yet
    for (const it of await DB.all('queue')) if (it.type === 'photo' && it.vid === v.id && it.payload.kind === kind && it.state !== 'failed') await DB.del('queue', it.qid);
    const lv = (await DB.get('visits', v.id)) || { ...v, synced: true, photos: {} };
    lv.photos = { ...(lv.photos || {}), [kind]: 'pending' }; await DB.put('visits', lv);
    v.photos = { ...(v.photos || {}), [kind]: 'pending' };
    const dv = device();   // the role is stamped at capture time, so a later role change cannot strand queued photos
    await enqueue('photo', v.id, { visit_id: v.id, kind, taken_at: new Date().toISOString(), width: big.width, height: big.height, bytes: big.blob.size,
      device_role: dv.role, device_name: dv.name, device_id: dv.id, source: opts.source || (big.original ? 'camera_app_original' : 'camera_app') }, { blob: big.blob });
    renderCard(); toast(navigator.onLine === false ? 'Saved on this device ✓ — uploads when online' : 'Saved ✓ uploading…');
  } catch (e) { toast('Could not read photo: ' + (e.message || e), 4000); }
}
async function deletePhoto(kind) {
  const v = S.card.v;
  for (const it of await DB.all('queue')) if (it.type === 'photo' && it.vid === v.id && it.payload.kind === kind) await DB.del('queue', it.qid);
  await DB.del('thumbs', v.id + ':' + kind).catch(() => {});
  const lv = await DB.get('visits', v.id); if (lv && lv.photos) { delete lv.photos[kind]; await DB.put('visits', lv); }
  delete v.photos[kind];
  await enqueue('delete_photo', v.id, { visit_id: v.id, kind }); renderCard();
}
/* ---------------- events ---------------- */
async function onClick(e) {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  if (a === 'modal-bg' && e.target !== el) return;
  switch (a) {
    case 'setup-connect': setupConnect(); break;
    case 'change-conn': showSetup(); break;
    case 'lock': LS.del('lb_unlock_until'); initLock(); show('lock'); break;
    case 'pick-branch': S.branch = el.dataset.b; LS.set('lb_branch', S.branch); goHome(); break;
    case 'home': goHome(); break;
    case 'unlock-role': managerPin(() => { S.mgrUntil = Date.now() + 5 * 60e3; renderSettings(); }); break;
    case 'set-role': if (S.mgrUntil > Date.now()) { setDevice({ role: el.dataset.v }); if (el.dataset.v === 'kiosk') clearCameraData(); toast('This device is now: ' + ROLE_NAME[el.dataset.v]); renderSettings(); } break;
    case 'save-devname': if (S.mgrUntil > Date.now()) { const n = ($('#dev-name').value || '').replace(/[<>]/g, '').trim().slice(0, 30); setDevice({ name: n || null }); toast('Name saved'); renderSettings(); } break;
    case 'note-ok': (S.notes || []).splice(+el.dataset.i, 1); renderChair(); break;
    case 'cap-close': stopCam(); show('card'); break;
    case 'cap-shoot': shoot(); break;
    case 'cap-native': stopCam(); show('card'); nativeCamera(captureKind); break;
    case 'cap-guides': $('#cap-guides').classList.toggle('hidden'); break;
    case 'settings': renderSettings(); break;
    case 'sync-now': S.sync.problem = null; backoff = 0; await flush(); if (!$('#scr-settings').classList.contains('hidden')) renderSettings(); break;
    case 'q-retry': { const it = await DB.get('queue', +el.dataset.q); if (it) { it.state = 'pending'; it.attempts = 0; await DB.put('queue', it); } await flush(); renderSettings(); break; }
    case 'set-branch': S.branch = el.dataset.b; LS.set('lb_branch', S.branch); renderSettings(); break;
    case 'set-facing': S.settings.facing = el.dataset.v; LS.set('lb_settings', S.settings); renderSettings(); break;
    case 'toggle-ncp': S.settings.namecardPhoto = !S.settings.namecardPhoto; LS.set('lb_settings', S.settings); renderSettings(); break;
    case 'start-checkin': showPhotoChoice(true); break;
    case 'pc-back': if (S.pcFromHome) goHome(); else staffExit(); break;
    case 'pc-visit': S.forms.visit = el.dataset.v; S.forms.waiver = el.dataset.v === 'first'; S.photos = { enabled: true, reason: null };
      $$('#pc-chips button').forEach(b => b.classList.remove('on')); renderPcForms(); break;
    case 'pc-form': {   // at least one form is always signed: switching one off switches the other on
      let note = '';
      // a returning client with neither form still signs the health declaration ("no changes"; "Yes" opens the waiver)
      if (el.dataset.k === 'waiver') { S.forms.waiver = !S.forms.waiver; if (!S.forms.waiver && !PE() && !RET()) { S.photos.enabled = true; S.photos.reason = null; note = 'Photo consent switched back on: every visit signs at least one form.'; } }
      else setNoPhotos(PE(), false, n => { note = n; });
      renderPcForms(note); break; }
    case 'pc-nophoto': { let note = ''; setNoPhotos(PE(), true, n => { note = n; }); renderPcForms(note); break; }
    case 'pc-start': if (S.forms.visit) show('lang'); break;
    case 'health': { const y = $('#ci-body').scrollTop; S.f.health_changed = el.dataset.v; renderStep(); $('#ci-body').scrollTop = y; break; }
    case 'pc-reason': { const on = !el.classList.contains('on'); $$('#pc-chips button').forEach(b => b.classList.remove('on')); if (on) el.classList.add('on'); S.photos.reason = on ? el.dataset.v : null; break; }
    case 'photos-on': photosToggle(el.dataset.id, true); break;
    case 'photos-off': photosOffPrompt(el.dataset.id); break;
    case 'off-reason': { const on = !el.classList.contains('on'); $$('[data-act=off-reason]').forEach(b => b.classList.remove('on')); if (on) el.classList.add('on'); break; }
    case 'off-confirm': { const r = $('[data-act=off-reason].on')?.dataset.v || null; $('#modal-root').innerHTML = ''; await photosToggle(el.dataset.id, false, r); break; }
    case 'staff-exit': staffExit(); break;
    case 'close-modal': case 'modal-bg': $('#modal-root').innerHTML = ''; break;
    case 'lang': startClient(el.dataset.lang); break;
    case 'switch-lang': S.lang = S.lang === 'en' ? 'th' : 'en'; renderStep(); break;
    case 'ci-cancel': show('lang'); break;
    case 'ci-back': S.step = Math.max(1, S.step - 1); renderStep(); break;
    case 'ci-next': if (validateStep()) { S.step++; renderStep(); } break;
    case 'ci-submit': submitCheckin(el); break;
    case 'ci-finish': S.step = 6; renderStep(); break;
    case 'done-next': clearTimeout(S.doneTimer); showPhotoChoice(false); break;
    case 'pref': S.f.preferred_contact = el.dataset.v; $$('[data-act=pref]').forEach(b => b.classList.toggle('on', b === el)); setInvalid('preferred_contact', false); break;
    case 'prev': S.f.prev_reaction = el.dataset.v; $$('[data-act=prev]').forEach(b => b.classList.toggle('on', b === el)); setInvalid('prev_reaction', false); break;
    case 'multi': {
      const g = el.dataset.g, v = el.dataset.v, arr = S.f[g];
      if (arr.includes(v)) arr.splice(arr.indexOf(v), 1);
      else { if (g === 'allergy_items') { if (v === 'none') arr.length = 0; else if (arr.includes('none')) arr.splice(arr.indexOf('none'), 1); } arr.push(v); }
      $$(`[data-g="${g}"]`).forEach(b => b.classList.toggle('on', arr.includes(b.dataset.v)));
      if (g === 'services') $('#svc-other').classList.toggle('hidden', !arr.includes('other'));
      setInvalid(g, false); break; }
    case 'chk': S.f[el.dataset.k] = !S.f[el.dataset.k]; el.classList.toggle('on', S.f[el.dataset.k]); el.classList.remove('invalid'); el.setAttribute('aria-checked', S.f[el.dataset.k]);
      if (el.dataset.k === 'marketing_consent' && !S.f.marketing_consent && !S.f.email.trim() && S.f.preferred_contact !== 'email') setInvalid('email', false);   // unticked: email no longer needed
      break;
    case 'added': S.f[el.dataset.k] = !S.f[el.dataset.k]; el.classList.toggle('on', S.f[el.dataset.k]);
      enqueue('added', S.visitId, { visit_id: S.visitId, line: !!S.f.added_line, whatsapp: !!S.f.added_whatsapp }); break;
    case 'sig-clear': S.f.signature = null; initSig(); break;
    case 'examples': openExamples(); break;
    case 'style': S.f.photo_style = el.dataset.v; $$('[data-act=style]').forEach(b => b.classList.toggle('on', b === el)); break;
    case 'style-info': $('#style-info').classList.toggle('hidden'); break;
    case 'gal': { const g = $('#gal'); g.scrollBy({ left: g.clientWidth * +el.dataset.d, behavior: 'smooth' }); break; }
    case 'chair': S.chairTab = 'before'; await openChair(); break;
    case 'chair-refresh': el.classList.add('spin'); await loadChair(); el.classList.remove('spin'); toast('List updated', 1200); break;
    case 'chair-tab': S.chairTab = el.dataset.v; renderChair(); break;
    case 'open-card': openCard(el.dataset.id); break;
    case 'chair-back': show('chair'); renderChair(); await loadChair(); break;
    case 'card-kind': S.card.kind = el.dataset.v; renderCard(); break;
    case 'capture': capture(el.dataset.kind); break;
    case 'del-photo': if (confirm('Delete this photo?')) await deletePhoto(el.dataset.kind); break;
  }
}

/* ---------------- mount + boot ---------------- */
function assetBase(ph) {
  if (ph.dataset.assets) return ph.dataset.assets.replace(/\/?$/, '/');
  const s = SCRIPT_EL || [...document.querySelectorAll('script[src]')].find(x => /lb-checkin(\.min)?\.js(\?|$)/.test(x.src));
  return s ? s.src.replace(/[?#].*$/, '').replace(/[^\/]*$/, '') : './';
}
function injectDocStyle() {
  if (document.getElementById('lb-checkin-doc-style')) return;
  const f = (fam, file, w, st = 'normal') => `@font-face{font-family:"${fam}";src:url(${A}lb-${file}) format("woff2");font-weight:${w};font-style:${st};font-display:swap}`;
  const st = document.createElement('style'); st.id = 'lb-checkin-doc-style';
  // @font-face must live in the document (not the shadow root). Family names are prefixed so the theme cannot clash.
  st.textContent = [f('LB Cormorant Garamond', 'cormorant.woff2', '300 700'), f('LB Cormorant Garamond', 'cormorant-italic.woff2', '300 700', 'italic'),
    f('LB Jost', 'jost.woff2', '100 900'), f('LB Sarabun', 'sarabun-300.woff2', '300'), f('LB Sarabun', 'sarabun-400.woff2', '400'), f('LB Sarabun', 'sarabun-500.woff2', '500 700')].join('\n') +
    '\nhtml.lb-checkin-open,html.lb-checkin-open body{overflow:hidden!important;height:100%!important;overscroll-behavior:none}';
  document.head.appendChild(st);
}
function mount() {
  if (HOST && document.body.contains(HOST)) return true;
  // placeholder <div id="lb-checkin" data-endpoint="…"> from the code block, or the <script data-endpoint="…"> tag itself (page header injection)
  const ph = document.getElementById('lb-checkin') || document.querySelector('[data-lb-checkin]') || (SCRIPT_EL && SCRIPT_EL.hasAttribute('data-endpoint') ? SCRIPT_EL : null);
  if (!ph || !document.body) return false;
  A = assetBase(ph); injectDocStyle();
  HOST = document.createElement('div'); HOST.className = 'lb-checkin-host'; HOST.dataset.endpoint = ph.dataset.endpoint || '';
  // appended to <body> (not inside the code block) so the block height, 'Fill screen' sections and transformed ancestors can't clip it
  document.body.appendChild(HOST); document.documentElement.classList.add('lb-checkin-open');
  R = HOST.attachShadow({ mode: 'open' });
  R.innerHTML = `<style>${LB_CSS.replace(/__A__/g, A)}</style><div class="lb-root" lang="en">${LB_SHELL.replace(/__A__/g, A)}</div>`;
  R.addEventListener('click', onClick);
  R.addEventListener('input', e => { const k = e.target.dataset?.f; if (!k || !S.f) return; S.f[k] = e.target.value; const fld = e.target.closest('.field'); if (fld) fld.classList.remove('invalid'); });
  R.addEventListener('change', e => { if (e.target.id === 'cam') onCaptured(e.target.files[0], { source: 'camera_app' }); });
  // pull down on Today's clients to refresh (several phones share the list)
  let pullY = null;
  R.addEventListener('touchstart', e => { const b = e.target.closest && e.target.closest('#chair-body'); pullY = b && b.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  R.addEventListener('touchmove', e => { if (pullY === null) return; const d = e.touches[0].clientY - pullY, hnt = $('#pull-hint'); if (hnt) hnt.classList.toggle('on', d > 70); }, { passive: true });
  R.addEventListener('touchend', e => { if (pullY === null) return; const d = (e.changedTouches[0] || {}).clientY - pullY; pullY = null; const hnt = $('#pull-hint'); if (hnt) hnt.classList.remove('on');
    if (d > 70 && visible('chair')) loadChair().then(() => toast('List updated', 1200)); }, { passive: true });
  ph.setAttribute('data-lb-mounted', '1');
  boot();
  return true;
}
function boot() {
  const c = conn();
  if (!c.token || !c.endpoint) showSetup();
  else if (LS.get('lb_unlock_until', 0) > Date.now()) afterUnlock();
  else { initLock(); show('lock'); }
  window.addEventListener('online', () => { backoff = 0; flushSoon(500); });
  setInterval(() => { if (S.sync.pending && !flushing) flush(); }, 30000);
  paintSync(); flushSoon(1500);
  if (c.token) gas('ping', {}, { timeout: 15000 }).then(r => { LS.set('lb_pin_len', r.pin_length || 4); if (r.manager_pin_length) LS.set('lb_mgr_pin_len', r.manager_pin_length); }).catch(() => {});
  // camera phones: refresh Today's clients when the app comes back to the front, and every 45 s while it is open
  const refresh = () => { if (role() !== 'camera' || document.visibilityState === 'hidden') return; if (visible('chair') || visible('card')) loadChair(); };
  window.addEventListener('focus', refresh); window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { if (visible('capture')) stopCam(); } else { refresh(); if (visible('capture')) startCam(); } });
  setInterval(() => { if (visible('chair')) refresh(); }, 45000);
  window.addEventListener('resize', () => { if (visible('capture')) layoutCapture(); });
  window.addEventListener('keydown', e => { if (!visible('capture')) return;   // keyboard-type Bluetooth shutters (Enter / Space / volume keys where the browser passes them on)
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'AudioVolumeUp' || e.key === 'VolumeUp') { e.preventDefault(); shoot(); } });
  if (HOST.dataset.sw !== 'off' && 'serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) && SW_URL && new URL(SW_URL, location.href).origin === location.origin)
    navigator.serviceWorker.register(SW_URL).catch(() => {});
}
const SCRIPT_EL = document.currentScript;
const SW_URL = window.LB_SW_URL || null;   // only set by the standalone index.html (static-host fallback)
window.__LB_CHECKIN__ = { version: LB_VERSION, mount, S, show, flush, DB, renderSettings, loadChair, device, get root() { return R; } };   // read-only: the role is changed in Settings (manager PIN)
// Squarespace may load pages via AJAX; run on DOMContentLoaded and on its page-load events; mount() is idempotent.
const tryMount = () => { try { mount(); } catch (e) { console.error('lb-checkin', e); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryMount); else tryMount();
window.addEventListener('mercury:load', tryMount);   // Squarespace 7.0 AJAX loading
window.addEventListener('load', tryMount);

})();
